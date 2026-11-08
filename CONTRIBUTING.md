# Contributing

Thanks for your interest in improving MindVault. This document covers the
basics of getting a change accepted.

## Getting set up

Follow the local setup steps in [README.md](README.md#getting-started) to run
the backend and frontend.

## Workflow

1. Fork the repository and create a branch off `main`. Use a short, descriptive
   branch name such as `feature/tag-colors` or `fix/note-ordering`.
2. Make your change. Keep commits small and focused — one logical change per
   commit.
3. Write commit messages as plain descriptions of the change in the imperative
   mood, e.g. `Fix tag filter resetting the current page`. Do not include
   co-author trailers or tool attributions.
4. Make sure the checks below pass before opening a pull request.
5. Open a PR against `main` with a summary of what changed and how you tested
   it. Paste the test/lint output in the PR description.

## Checks

All pull requests must keep these green (they also run in CI):

```bash
cd backend && DJANGO_DEBUG=true python manage.py test
cd frontend && npm run lint && npm run build
```

## Style

- Match the existing conventions in each part of the codebase instead of
  introducing new libraries or patterns.
- Backend: standard Django/DRF style. Every API change should come with tests
  in `backend/core/tests.py`.
- Frontend: TypeScript, functional components, Tailwind utility classes.
  Accessibility matters — labelled inputs, keyboard navigation and visible
  focus are required, not optional.
- Never commit secrets, `.env` files, `db.sqlite3` or `__pycache__`.

## Reporting bugs and suggesting features

Open an issue describing the problem or proposal. For bugs, include steps to
reproduce, what you expected and what actually happened. Please do not report
security issues publicly — see [SECURITY.md](SECURITY.md).
