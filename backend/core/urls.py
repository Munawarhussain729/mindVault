# core/urls.py
from django.urls import path
from .views import NoteListCreateView, NoteDetailView, TagListCreateView, TagDetailView, RegisterView

urlpatterns = [
    path('auth/register/',RegisterView.as_view(), name="register"),
    path("notes/", NoteListCreateView.as_view(), name="note-list-create"),
    path("notes/<int:pk>/", NoteDetailView.as_view(), name="note-detail"),
    path("tags/", TagListCreateView.as_view(), name="tag-list-create"),
    path("tags/<int:pk>/", TagDetailView.as_view(), name="tag-detail")
]
