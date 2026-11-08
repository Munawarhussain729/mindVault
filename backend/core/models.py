from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    is_global = models.BooleanField(default=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
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
    
    