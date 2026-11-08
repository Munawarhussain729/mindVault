from rest_framework import serializers, permissions,generics
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Note, Tag
import pdb

User = get_user_model()

class TagSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    label = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = ("id","name", "label")
    
    def get_label(self, obj):
        return obj.name.lower()
    
    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user
        name = validated_data.get("name").strip()
        tag = Tag.objects.create(name=name.title(), owner=user, is_global=False)
        return tag


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TagSerializer

    def get_queryset(self):
        return Tag.objects.filter(user = self.request.user).prefetch_related("owner")
class NoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many = True, required = False)
    created_at = serializers.DateTimeField(read_only = True)
    updated_at = serializers.DateTimeField(read_only = True)

    class Meta:
        model = Note
        fields = ("id", "title", "content", "tags", "created_at", "updated_at")
    
    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        tags_data = validated_data.pop("tags",[])
        note = Note.objects.create(user=user, **validated_data)
        pdb.set_trace()  
        for t in tags_data:
            tag = None
            tag_id = t.get("id")
            tag_label = t.get("label")

            if tag_id:
                try:
                    candidate = Tag.objects.get(pk=tag_id)
                except Tag.DoesNotExist:
                    raise serializers.ValidationError(f"Tag id {tag_id} does not exist.")
                if not candidate.is_global and candidate.owner != user:
                    raise serializers.ValidationError(f"Tag id {tag_id} is not accessible")
                tag = candidate
            elif tag_label:
                input_label = tag_label.strip()
                if not input_label:
                    continue
                candidate = Tag.objects.filter(name__iexact=input_label, is_global=True).first()
                if candidate:
                    tag = candidate
                else:
                    stored_name = input_label.title()
                    tag = Tag.objects.create(name=stored_name, is_global=False, owner=user)
        
            if tag:
                note.tags.add(tag)
        note.save()
        note.refresh_from_db()  
        return note

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user