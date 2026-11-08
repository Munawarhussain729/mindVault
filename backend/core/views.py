from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination

from .models import Note, Tag
from .serializers import NoteSerializer, RegisterSerializer, TagSerializer

User = get_user_model()


class NotesPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50


class NoteListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NoteSerializer
    pagination_class = NotesPagination

    def get_queryset(self):
        queryset = (
            Note.objects.filter(user=self.request.user)
            .prefetch_related("tags")
            .order_by("-updated_at")
        )

        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )

        # ?tag= accepts a tag id, or a tag name for convenience.
        tag = self.request.query_params.get("tag", "").strip()
        if tag:
            if tag.isdigit():
                queryset = queryset.filter(tags__id=int(tag))
            else:
                queryset = queryset.filter(tags__name__iexact=tag)

        return queryset.distinct()


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NoteSerializer

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).prefetch_related("tags")


class TagListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TagSerializer

    def get_queryset(self):
        user = self.request.user
        return Tag.objects.filter(Q(owner=user) | Q(is_global=True)).order_by("name")


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TagSerializer

    def get_queryset(self):
        # Read access includes global tags; mutations are checked in _editable_tag.
        return Tag.objects.filter(
            Q(owner=self.request.user) | Q(is_global=True)
        )

    def _editable_tag(self):
        tag = self.get_object()
        if tag.is_global or tag.owner_id != self.request.user.id:
            raise PermissionDenied(
                "Global tags are read-only and personal tags can only be "
                "modified by their owner."
            )
        return tag

    def update(self, request, *args, **kwargs):
        self._editable_tag()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._editable_tag()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._editable_tag()
        return super().destroy(request, *args, **kwargs)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
