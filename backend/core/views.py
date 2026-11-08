from rest_framework import generics, permissions
from .models import Note, Tag
from django.db.models import Q
from rest_framework.response import Response
from .serializers import NoteSerializer, TagSerializer, RegisterSerializer
from django.contrib.auth import get_user_model

User = get_user_model()
class NoteListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NoteSerializer

    def get_queryset(self):
        return (
            Note.objects.filter(user=self.request.user)
            .prefetch_related("tags")
        )

    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NoteSerializer

    def get_queryset(self):
        return Note.objects.filter(user = self.request.user).prefetch_related("tags")



class TagListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TagSerializer

    def get_queryset(self):
        user = self.request.user
        return Tag.objects.filter(Q(owner=user) | Q(owner__isnull=True))


    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    
class TagDetailView(generics.RetrieveUpdateDestroyAPIView):

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TagSerializer

    def get_queryset(self):
        return Tag.objects.filter(owner=self.request.user)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors) 
            return Response(serializer.errors, status=400)
        self.perform_create(serializer)
        return Response(serializer.data, status=201)