from django.db import models
from django.contrib.auth.models import User


class Tag(models.Model):
    # Global tags (is_global=True) have owner=None and are readable by everyone.
    # Personal tags are unique per owner, enforced by the constraint below.
    name = models.CharField(max_length=50)
    is_global = models.BooleanField(default=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"], name="unique_tag_name_per_owner"
            ),
        ]

    def __str__(self):
        return self.name


class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    title = models.CharField(max_length=200)
    content = models.TextField()
    tags = models.ManyToManyField(Tag, blank=True, related_name="notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
