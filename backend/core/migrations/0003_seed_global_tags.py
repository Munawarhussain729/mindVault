from django.db import migrations

def seed_global_tags(apps, schema_editor):
    Tag = apps.get_model("core", "Tag")  # ✅ Corrected get_model

    tag_names = [
        "Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography",
        "Computer Science", "Programming", "Web Development", "AI", "Algorithms", "Projects",
        "Assignments", "Exams", "Revision", "Notes", "Formulas", "Definitions", "Vocabulary",
        "Concepts", "Motivation", "Productivity", "Time Management", "Goals", "Habits", "Discipline",
        "Mindset", "Health", "Fitness", "Self Improvement", "Career", "Ideas", "Inspiration",
        "Books", "Quotes", "Life Lessons", "Finance", "Money Management", "Entrepreneurship",
        "Creativity", "Problem Solving", "Critical Thinking", "Communication", "Leadership",
        "Collaboration", "Experiments", "Daily Reflection", "Mistakes Learned", "Achievements", "Questions"
    ]

    for name in tag_names:
        Tag.objects.get_or_create(name=name, defaults={"is_global": True, "owner": None})  # ✅ Corrected objects + defaults

def unseed_global_tags(apps, schema_editor):
    Tag = apps.get_model("core", "Tag")
    Tag.objects.filter(is_global=True, owner=None).delete()

class Migration(migrations.Migration):
    dependencies = [
        ("core", "0002_tag_is_global_tag_owner"),
    ]

    operations = [
        migrations.RunPython(seed_global_tags, unseed_global_tags)
    ]
