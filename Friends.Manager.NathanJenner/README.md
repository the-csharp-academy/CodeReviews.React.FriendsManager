# Friends Manager

A small full-stack app for keeping up with the people who matter. It highlights who you're overdue to contact, based on when you last talked to them and how often you'd like to.

**Stack:** ASP.NET Core (.NET 10) + EF Core + SQL Server LocalDB; React + TypeScript + Redux Toolkit (RTK Query) + Vite.

## What it does

- Add, edit, and delete friends with a last contact date/type and a desired contact frequency (in days).
- Organize friends into categories; a category cannot be deleted while friends use it.
- Overdue friends sort to the top and are highlighted; a filter shows only overdue friends.
- Shows validation, server, and network errors without losing what you typed.

The database is created and seeded automatically the first time the API runs.

## Prerequisites

- .NET 10 SDK
- SQL Server Express LocalDB (installs with the Visual Studio "ASP.NET and web development" workload)
- Node.js 24 LTS and npm

## Setup

From the repository root:

```powershell
dotnet tool restore
dotnet restore Friends.Manager.NathanJenner.slnx
npm --prefix friends.manager.nathanjenner.client ci
dotnet dev-certs https --trust
```

Make sure the `Demo` LocalDB instance used by `appsettings.json` (`Server=(localdb)\Demo;Database=Friends;...`) exists:

```powershell
sqllocaldb info
sqllocaldb create Demo   # only if it is not listed
sqllocaldb start Demo
```

No manual migration step is needed; the API applies migrations and seeds sample data on first run.

> Using a different SQL Server? Override `ConnectionStrings__DefaultConnection` as an environment variable instead of editing `appsettings.json`.

## Running the app

```powershell
dotnet run --project Friends.Manager.NathanJenner.Server --launch-profile https
```

This starts the API (https://localhost:7277) and the Vite dev server (https://localhost:5173), proxying `/api/*` from the client to the server. Open **https://localhost:5173**.

If Vite doesn't start automatically, run it separately:

```powershell
npm --prefix friends.manager.nathanjenner.client run dev
```

In Visual Studio: set **Friends.Manager.NathanJenner.Server** as the startup project, select the **https** launch profile, and press F5.

### Other useful commands

```powershell
dotnet build Friends.Manager.NathanJenner.slnx
npm --prefix friends.manager.nathanjenner.client run build
npm --prefix friends.manager.nathanjenner.client run lint
npm --prefix friends.manager.nathanjenner.client test
```

## How it works

- **Overdue rule:** days overdue = (today minus last contact date) minus desired frequency in days. Positive is overdue, zero is due today. Dates use UTC calendar days to avoid daylight-saving issues. See `friends.manager.nathanjenner.client/src/lib/attention.ts`.
- **API:** `Controllers/FriendsController.cs` and `CategoriesController.cs` use EF Core directly against `ApplicationDbContext`. Request DTOs (`Contracts/`) are separate from EF entities to prevent overposting and carry validation attributes. Unexpected errors are logged server-side and never leak details to the client; constraint conflicts return 409.
- **Client:** `store.ts` defines one RTK Query API slice (`friendshipsApi`) with queries/mutations for friends and categories. Mutations invalidate cache tags so related components refetch automatically; this is the shared state. Form drafts and filters stay local to components with `useState`.
- **Categories** are a real foreign key (`DeleteBehavior.Restrict`), not a free-text field, so renames apply everywhere and in-use categories can't be deleted.

## API reference

Base URL: `/api` (proxied from the client).

| Method | Route | Notes |
| --- | --- | --- |
| GET | `/friends`, `/friends/{id}` | List / get |
| POST | `/friends` | 201 |
| PUT | `/friends/{id}` | 200 / 404 |
| DELETE | `/friends/{id}` | 204 / 404 |
| GET | `/categories`, `/categories/{id}` | List / get |
| POST | `/categories` | 201 |
| PUT | `/categories/{id}` | 200 / 404 |
| DELETE | `/categories/{id}` | 204 / 404 / 409 if in use |

`FriendRequest` body: `{ name, lastContactDate, lastContactType, desiredContactFrequencyDays, categoryId }`, where `lastContactType` is one of `Unknown`, `Text`, `Phone`, `Video`, `InPerson`, `Email`, `Other`.

## Development reflection

The hardest part wasn't the code; it was pinning down what "needs attention" actually means. Once the rule became *overdue when days since last contact exceeds the desired frequency*, the data model, sort order, and tests all followed from that one sentence.

Compiling isn't the same as working: the original scaffold built cleanly but had a proxy pointed at the wrong endpoint and a category "update" that inserted a new row instead. Tracing a single user action end-to-end (click to API to database and back) caught both.

The trickiest migration was converting a `ContactFrequency` enum to a plain day count. EF's default inference would have silently renamed a column instead of converting its meaning, so the conversion had to be written and tested explicitly.

Redux Toolkit's RTK Query turned out to be the right amount of state management: it owns server data and cache invalidation, while form drafts and filters stay as local component state. That kept the store small and the components easy to follow.

Next steps to prioritize: a contact-history table instead of overwriting the last contact, optimistic concurrency, and automated browser tests to replace the manual checklist.
