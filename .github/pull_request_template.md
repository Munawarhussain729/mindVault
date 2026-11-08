## What changed

## How you tested it

Paste the output of the checks from [CONTRIBUTING.md](../CONTRIBUTING.md):

```
cd backend && DJANGO_DEBUG=true python manage.py test
cd frontend && npm run lint && npm run build
```

- [ ] Tests added or updated for behaviour changes
- [ ] No secrets, `.env` files or local databases included
