# Quiet Board

Quiet Board is a full-stack anonymous message board built with Express, MongoDB, Mongoose, and a small browser client. It is designed for low-pressure conversations: people can start a thread, reply without an account, and moderate their own posts with a private deletion password.

## What It Does

- Creates boards dynamically from the URL, such as `/b/design`.
- Shows the ten most recently active threads and three recent replies per thread.
- Supports full-thread views with every reply.
- Allows reporting and password-protected moderation.
- Sanitizes private passwords and report flags from public GET responses.
- Uses Helmet security headers for framing, DNS prefetching, and referrer policy.

## Project Shape

```text
server.js             Express app, security, pages, and startup
api.js                Thread and reply route handlers
mongoose-models.js    Board, thread, and reply schemas
DB-module.js          MongoDB connection lifecycle
index.html            API console and project entry page
board.html            Board view
thread.html           Full thread view
style.css             Quiet Board visual system
tests/                Functional API tests
```

## Run It Locally

1. Install dependencies:

	```bash
	npm install
	```

2. Add a `.env` file with a MongoDB connection string:

	```env
	DB=mongodb://localhost:27017/quiet-board
	PORT=3000
	```

3. Start the app:

	```bash
	npm start
	```

Open `http://localhost:3000`, or visit a board at `http://localhost:3000/b/design`.

## Test It

The functional suite covers thread creation, recent-thread retrieval, full-thread retrieval, replies, reporting, and password-protected deletion.

```bash
npm test
```

The test command expects `DB` to point to a reachable MongoDB instance. Keep `.env` private; it is excluded from version control.

## API Notes

The API follows the freeCodeCamp Anonymous Message Board contract:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/threads/:board` | Create a thread |
| `GET` | `/api/threads/:board` | List recent threads |
| `PUT` | `/api/threads/:board` | Report a thread |
| `DELETE` | `/api/threads/:board` | Delete a thread |
| `POST` | `/api/replies/:board` | Create a reply |
| `GET` | `/api/replies/:board?thread_id=...` | View a full thread |
| `PUT` | `/api/replies/:board` | Report a reply |
| `DELETE` | `/api/replies/:board` | Soft-delete a reply |

Quiet Board is intentionally small: the important behavior stays visible in the route handlers and the data model, making the project easy to read, run, and extend.

## LICENSE

`MIT`
