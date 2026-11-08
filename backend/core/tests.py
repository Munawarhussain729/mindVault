from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Note, Tag

User = get_user_model()

REGISTER_URL = "/api/auth/register/"
LOGIN_URL = "/api/auth/login/"
NOTES_URL = "/api/notes/"
TAGS_URL = "/api/tags/"
PASSWORD = "Str0ng!Passw0rd"


def note_url(pk):
    return f"/api/notes/{pk}/"


def tag_url(pk):
    return f"/api/tags/{pk}/"


class ApiTestCase(TestCase):
    """Registers two users through the API and gives each an authenticated client."""

    def setUp(self):
        self.client_a = APIClient()
        self.client_b = APIClient()
        self.user_a = self._register(self.client_a, "alice", "alice@example.com")
        self.user_b = self._register(self.client_b, "bob", "bob@example.com")
        self._authenticate(self.client_a, "alice")
        self._authenticate(self.client_b, "bob")

    def _register(self, client, username, email):
        response = client.post(
            REGISTER_URL,
            {"username": username, "email": email, "password": PASSWORD},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        return User.objects.get(username=username)

    def _authenticate(self, client, username):
        response = client.post(
            LOGIN_URL, {"username": username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(response.status_code, 200, response.data)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def _create_note(self, client, **overrides):
        payload = {"title": "Shopping list", "content": "Milk and eggs"}
        payload.update(overrides)
        response = client.post(NOTES_URL, payload, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        return response.data


class AuthTests(ApiTestCase):
    def test_register_creates_user(self):
        self.assertTrue(User.objects.filter(username="alice").exists())

    def test_login_returns_jwt_tokens(self):
        response = self.client_a.post(
            LOGIN_URL,
            {"username": "alice", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_unauthenticated_requests_are_rejected(self):
        client = APIClient()
        for method, url in (
            ("get", NOTES_URL),
            ("post", NOTES_URL),
            ("get", TAGS_URL),
            ("post", TAGS_URL),
        ):
            response = getattr(client, method)(url, {}, format="json")
            self.assertEqual(response.status_code, 401, f"{method} {url}")


class NoteCrudTests(ApiTestCase):
    def test_create_and_list_note(self):
        note = self._create_note(self.client_a)

        response = self.client_a.get(NOTES_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], note["id"])
        self.assertEqual(response.data["results"][0]["title"], "Shopping list")

    def test_retrieve_note(self):
        note = self._create_note(self.client_a)
        response = self.client_a.get(note_url(note["id"]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["content"], "Milk and eggs")

    def test_update_note(self):
        note = self._create_note(self.client_a)
        response = self.client_a.patch(
            note_url(note["id"]), {"title": "Weekly list"}, format="json"
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["title"], "Weekly list")

        response = self.client_a.put(
            note_url(note["id"]),
            {"title": "Full rewrite", "content": "New body"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["content"], "New body")

    def test_delete_note(self):
        note = self._create_note(self.client_a)
        response = self.client_a.delete(note_url(note["id"]))
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.client_a.get(note_url(note["id"])).status_code, 404)

    def test_title_is_required(self):
        for title in ("", "   "):
            response = self.client_a.post(
                NOTES_URL, {"title": title, "content": "body"}, format="json"
            )
            self.assertEqual(response.status_code, 400, title)

        response = self.client_a.post(
            NOTES_URL, {"content": "body"}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_title_max_length(self):
        response = self.client_a.post(
            NOTES_URL, {"title": "x" * 201, "content": "body"}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_pagination(self):
        for i in range(15):
            self._create_note(self.client_a, title=f"Note {i}")

        response = self.client_a.get(NOTES_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 15)
        self.assertEqual(len(response.data["results"]), 12)
        self.assertIsNotNone(response.data["next"])

        page_two = self.client_a.get(f"{NOTES_URL}?page=2")
        self.assertEqual(len(page_two.data["results"]), 3)


class OwnershipTests(ApiTestCase):
    def test_users_only_see_their_own_notes(self):
        note = self._create_note(self.client_a)
        self.assertEqual(self.client_b.get(NOTES_URL).data["count"], 0)

        for method in ("get", "patch", "put", "delete"):
            response = getattr(self.client_b, method)(
                note_url(note["id"]), {}, format="json"
            )
            self.assertEqual(response.status_code, 404, method)

    def test_users_only_see_their_own_tags(self):
        tag = self._create_tag(self.client_a, "Secret project")

        listed_ids = [t["id"] for t in self.client_b.get(TAGS_URL).data]
        self.assertNotIn(tag["id"], listed_ids)

        for method in ("get", "patch", "put", "delete"):
            response = getattr(self.client_b, method)(
                tag_url(tag["id"]), {}, format="json"
            )
            self.assertEqual(response.status_code, 404, method)

    def test_cannot_attach_another_users_tag_by_id(self):
        foreign_tag = self._create_tag(self.client_a, "Alice only")
        response = self.client_b.post(
            NOTES_URL,
            {"title": "N", "content": "C", "tags": [{"id": foreign_tag["id"]}]},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def _create_tag(self, client, name):
        response = client.post(TAGS_URL, {"name": name}, format="json")
        assert response.status_code == 201, response.data
        return response.data


class TagTests(ApiTestCase):
    def test_create_tag_normalizes_name(self):
        response = self.client_a.post(TAGS_URL, {"name": "  work notes "}, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["name"], "Work Notes")
        self.assertFalse(response.data["is_global"])

    def test_tag_name_is_unique_per_user(self):
        self.client_a.post(TAGS_URL, {"name": "Work"}, format="json")
        duplicate = self.client_a.post(TAGS_URL, {"name": "work"}, format="json")
        self.assertEqual(duplicate.status_code, 400)

        # A different user may still use the same name.
        other = self.client_b.post(TAGS_URL, {"name": "work"}, format="json")
        self.assertEqual(other.status_code, 201, other.data)

    def test_rename_tag(self):
        tag_id = self.client_a.post(TAGS_URL, {"name": "Old"}, format="json").data["id"]
        response = self.client_a.patch(
            tag_url(tag_id), {"name": "New"}, format="json"
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["name"], "New")

    def test_delete_tag(self):
        tag_id = self.client_a.post(TAGS_URL, {"name": "Temp"}, format="json").data["id"]
        self.assertEqual(self.client_a.delete(tag_url(tag_id)).status_code, 204)
        self.assertEqual(self.client_a.get(tag_url(tag_id)).status_code, 404)

    def test_global_tags_are_readable_but_read_only(self):
        global_tag = Tag.objects.get(name="Mathematics", is_global=True)

        listed_ids = [t["id"] for t in self.client_a.get(TAGS_URL).data]
        self.assertIn(global_tag.id, listed_ids)
        self.assertEqual(self.client_a.get(tag_url(global_tag.id)).status_code, 200)

        for method in ("patch", "put", "delete"):
            response = getattr(self.client_a, method)(
                tag_url(global_tag.id), {"name": "Hacked"}, format="json"
            )
            self.assertEqual(response.status_code, 403, method)


class NoteTagTests(ApiTestCase):
    def test_create_note_with_existing_and_new_tags(self):
        existing = self.client_a.post(TAGS_URL, {"name": "Work"}, format="json").data
        global_tag = Tag.objects.get(name="Mathematics", is_global=True)

        note = self._create_note(
            self.client_a,
            tags=[
                {"id": existing["id"]},
                {"id": global_tag.id},
                {"name": "brand new"},
            ],
        )
        names = {t["name"] for t in note["tags"]}
        self.assertEqual(names, {"Work", "Mathematics", "Brand New"})

        new_tag = Tag.objects.get(name="Brand New")
        self.assertEqual(new_tag.owner, self.user_a)
        self.assertFalse(new_tag.is_global)

    def test_new_tag_name_reuses_existing_tag(self):
        self._create_note(self.client_a, tags=[{"name": "work"}])
        self._create_note(self.client_a, title="Other", tags=[{"name": "WORK"}])
        self.assertEqual(Tag.objects.filter(owner=self.user_a, name="Work").count(), 1)

    def test_update_note_replaces_tags(self):
        keep = self.client_a.post(TAGS_URL, {"name": "Keep"}, format="json").data
        note = self._create_note(self.client_a, tags=[{"name": "drop me"}])

        response = self.client_a.patch(
            note_url(note["id"]), {"tags": [{"id": keep["id"]}]}, format="json"
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual([t["id"] for t in response.data["tags"]], [keep["id"]])


class SearchAndFilterTests(ApiTestCase):
    def setUp(self):
        super().setUp()
        self.work_tag = self.client_a.post(
            TAGS_URL, {"name": "Work"}, format="json"
        ).data
        self._create_note(
            self.client_a, title="Meeting notes", content="Discuss roadmap",
            tags=[{"id": self.work_tag["id"]}],
        )
        self._create_note(self.client_a, title="Recipe", content="Tomato soup")
        self._create_note(
            self.client_b, title="Meeting notes", content="Bob's version"
        )

    def test_search_matches_title_and_content(self):
        response = self.client_a.get(NOTES_URL, {"search": "meeting"})
        self.assertEqual(response.data["count"], 1)

        response = self.client_a.get(NOTES_URL, {"search": "soup"})
        self.assertEqual(response.data["count"], 1)

        response = self.client_a.get(NOTES_URL, {"search": "nonexistent"})
        self.assertEqual(response.data["count"], 0)

    def test_search_does_not_leak_other_users_notes(self):
        response = self.client_a.get(NOTES_URL, {"search": "meeting"})
        titles = [r["title"] for r in response.data["results"]]
        self.assertNotIn("Bob's version", titles)
        self.assertEqual(response.data["count"], 1)

    def test_filter_by_tag_id_and_name(self):
        response = self.client_a.get(NOTES_URL, {"tag": str(self.work_tag["id"])})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["title"], "Meeting notes"
        )

        response = self.client_a.get(NOTES_URL, {"tag": "work"})
        self.assertEqual(response.data["count"], 1)

        response = self.client_a.get(NOTES_URL, {"tag": "Work"})
        self.assertEqual(response.data["results"][0]["title"], "Meeting notes")
