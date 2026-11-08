from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import serializers

from .models import Note, Tag

User = get_user_model()


def normalize_tag_name(name):
    return " ".join(name.strip().split()).title()


class TagSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField(required=False, max_length=50)
    label = serializers.SerializerMethodField()
    is_global = serializers.BooleanField(read_only=True)

    class Meta:
        model = Tag
        fields = ("id", "name", "label", "is_global")

    def get_label(self, obj):
        return obj.name.lower()

    def validate_name(self, value):
        normalized = normalize_tag_name(value)
        if not normalized:
            raise serializers.ValidationError("Tag name cannot be blank.")
        return normalized

    def validate(self, attrs):
        # self.parent is only None when this serializer is used directly on the
        # /tags/ endpoints. Nested payloads inside a note attach tags by name or
        # id and must skip the create/rename uniqueness check.
        if getattr(self, "parent", None) is None:
            name = attrs.get("name")
            if self.instance is None and not name:
                raise serializers.ValidationError({"name": "This field is required."})
            if name:
                self._validate_unique_per_owner(name)
        return attrs

    def _validate_unique_per_owner(self, name):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        duplicates = Tag.objects.filter(
            Q(name__iexact=name) & (Q(owner=user) | Q(is_global=True))
        )
        if self.instance is not None:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError(
                {"name": "A tag with this name already exists."}
            )

    def create(self, validated_data):
        user = self.context["request"].user
        tag, _ = Tag.objects.get_or_create(
            name=validated_data["name"], owner=user, defaults={"is_global": False}
        )
        return tag


class NoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Note
        fields = ("id", "title", "content", "tags", "created_at", "updated_at")

    def validate_title(self, value):
        title = value.strip()
        if not title:
            raise serializers.ValidationError("Title cannot be blank.")
        return title

    def create(self, validated_data):
        tags_data = validated_data.pop("tags", [])
        note = Note.objects.create(
            user=self.context["request"].user, **validated_data
        )
        note.tags.set(self._resolve_tags(tags_data))
        return note

    def update(self, instance, validated_data):
        tags_data = validated_data.pop("tags", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        if tags_data is not None:
            instance.tags.set(self._resolve_tags(tags_data))
        return instance

    def _resolve_tags(self, tags_data):
        # Each item is either {"id": <existing tag id>} or {"name": <new/existing
        # tag name>}. New names become personal tags owned by the requester.
        user = self.context["request"].user
        resolved = []
        for item in tags_data:
            tag = self._resolve_tag(item, user)
            if tag is not None and tag not in resolved:
                resolved.append(tag)
        return resolved

    def _resolve_tag(self, item, user):
        tag_id = item.get("id")
        name = (item.get("name") or item.get("label") or "").strip()

        if tag_id:
            tag = (
                Tag.objects.filter(pk=tag_id)
                .filter(Q(is_global=True) | Q(owner=user))
                .first()
            )
            if tag is None:
                raise serializers.ValidationError(
                    {"tags": f"Tag {tag_id} does not exist or is not accessible."}
                )
            return tag

        if not name:
            return None

        normalized = normalize_tag_name(name)
        tag = (
            Tag.objects.filter(name__iexact=normalized)
            .filter(Q(owner=user) | Q(is_global=True))
            .first()
        )
        if tag is None:
            tag = Tag.objects.create(name=normalized, owner=user, is_global=False)
        return tag


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
