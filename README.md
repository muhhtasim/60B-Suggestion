# 60B Suggestion

A private notes-sharing hub for students in university section 60B. Browse and search class notes, preview PDFs and images, download useful material, and share notes with classmates.

## Features

- Responsive home page, notes library, note details, and upload flow.
- Search by title, subject, and description; filter by subject and sort newest first.
- PDF and image previews, with download counts updated by the API.
- Drag-and-drop PDF, JPG, JPEG, and PNG uploads (maximum 15 MB).
- MongoDB persistence and Cloudinary file storage.
- Persistent light and dark themes, loading skeletons, and friendly error/empty states.
- Optional development sample data.

## Tech Stack

- React, Vite, Tailwind CSS, React Router, Framer Motion, Axios, and Lucide icons.
- Node.js, Express, Mongoose, MongoDB Atlas, and Cloudinary.

## Project Structure

```text
client/
	src/
		services/       Axios API client
		App.jsx         Routes and theme preference
		components.jsx  Shared navigation, cards, search, and states
		pages.jsx       Home, notes, upload, and details pages
		App.css         Responsive component and page styling
		index.css       Global styles, theme tokens, and Tailwind
server/
	config/           Cloudinary configuration
	middleware/       Upload validation
	models/           Mongoose note model
	routes/           Notes and subjects endpoints
	index.js          Express app and MongoDB connection
	seed.js           Development sample notes
.env.example
```

## Requirements

- Node.js 20 or later and npm.
- A MongoDB Atlas cluster (or another MongoDB connection string).
- A Cloudinary account for uploaded files.

## Environment Variables

Copy `.env.example` to `.env` in the repository root. Keep `.env` private; it is ignored by Git.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string for the notes database. |
| `CLOUDINARY_CLOUD_NAME` | Yes for uploads | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Yes for uploads | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes for uploads | Cloudinary API secret. |
| `CLIENT_URL` | For deployment | Allowed browser origin; defaults to `http://localhost:5173`. |
| `PORT` | No | API port; defaults to `5000`. |
| `VITE_API_URL` | No | API base URL; defaults to `http://localhost:5000/api`. |
| `ADMIN_API_KEY` | No | Enables the protected note-delete endpoint when configured. |

## Local Development

Install dependencies from the repository root:

```bash
npm --prefix server install
npm --prefix client install
```

Start the API in one terminal:

```bash
npm --prefix server run dev
```

Start the Vite app in another terminal:

```bash
npm --prefix client run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The API health check is at `http://localhost:5000/api/health`.

To add four sample notes to the configured development database:

```bash
npm --prefix server run seed
```

The seed command replaces only records with its own sample filenames. Sample file URLs are public demonstration assets; real uploads are stored in your Cloudinary account.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/notes?q=&subject=` | List newest notes, optionally searching and filtering. |
| `GET` | `/api/notes/:id` | Get one note. |
| `POST` | `/api/notes` | Create a note using multipart fields `title`, `subject`, `description`, `uploaderName`, and `file`. |
| `PATCH` | `/api/notes/:id/download` | Increment the count and redirect to the stored file. |
| `DELETE` | `/api/notes/:id` | Delete a note; requires the `x-admin-key` header matching `ADMIN_API_KEY`. |
| `GET` | `/api/subjects` | Get standard and saved subjects. |
| `GET` | `/api/health` | Check API availability. |

Uploads are limited to PDF/JPEG/PNG, checked against file signatures, and capped at 15 MB. API error responses use a short `message` suitable for display to users.

## MongoDB Setup

Create a MongoDB Atlas project and cluster, add a database user, and allow network access from the machine running the API. Copy the cluster connection string into `MONGODB_URI`, replacing its username, password, and database name as needed. Keep network access as restricted as your development/deployment setup permits.

## Cloudinary Setup

Create a Cloudinary account and copy the cloud name, API key, and API secret from the dashboard into `.env`. Uploaded files go into the `60b-suggestion/notes` folder. File bytes are held in memory only for the upload request and are not written into the repository.

## Deployment

Deploy the client and API as separate services or behind a reverse proxy. Build the client with `npm --prefix client run build` and serve `client/dist` using a static hosting provider. Run the API with `npm --prefix server start`; set its production MongoDB and Cloudinary variables, and set `CLIENT_URL` to the deployed client origin. Set `VITE_API_URL` to the deployed API's `/api` URL at client build time. Use HTTPS, restrict MongoDB network access, and store secrets in the hosting provider's secret manager. The API's note deletion route is disabled until `ADMIN_API_KEY` is set.

## Future Improvements

- Authentication and moderation for shared uploads.
- Pagination for larger libraries.
- Subject and upload reporting tools.
- Automated API and browser tests.
