# Simply-Property

## Current Scope

This repository is currently focused on the data-entry screens and field
mapping for Property360Plus-style workflows.

- [Property360Plus basic spec](docs/property360plus-basic-spec.md)
- [Implementation notes](tests/implementation.md)

Calculation components are intentionally deferred until more screenshots are
collected and the live site is tested against the captured fields.

## App Boilerplate

The current codebase now includes a RAM-first application core under
`src/app/`.

- `createInMemoryStore()` gives you a lightweight test store with no database.
- `PropertyManagementApp` is the service layer the UI should call.
- `src/app/sqlite-store.stub.ts` shows the shape of a future SQLite adapter.

This makes it easy to test form flows and backend-linked updates before a real
database is connected.

Typical first test loop:

1. Create an in-memory store.
2. Create owners, properties, and leases through the service.
3. Record deposits, payments, expenses, and withheld amounts.
4. Assert the resulting balances and invoice state in `npm test`.

## React Shell

There is now a minimal React shell under `src/web/` for visual testing.

- `index.html` bootstraps the shell.
- `src/web/App.tsx` holds the editable panels and the live state inspector.
- `src/web/styles.css` keeps the layout plain and easy to restyle.

Once the React dependencies are installed, run:

```bash
npm run dev:web
```

The shell stays in memory only, which makes it handy for small, repeatable
tests before any database work begins.

If your local `npm` setup still needs a repair, the repo is still useful as a
scaffold: the React files, Vite config, and app service layer are all already in
place.
