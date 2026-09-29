# InternShowcase – Intern Project Showcase Platform

Full-stack platform where interns upload projects (images, descriptions, tags) and share a link with employers.

- **Frontend:** React 18 + Vite + Tailwind CSS (blue theme, navbar, live preview editor)
- **Backend:** Node.js + Express (REST API, image uploads with Multer)
- **Database:** MongoDB (Mongoose)

## Requirements
- Node.js 18+
- MongoDB running locally, or a free MongoDB Atlas connection string

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI if needed
npm run dev               # http://localhost:5000
```

### 2. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```
In development Vite proxies `/api` and `/uploads` to the backend, so no extra config is needed.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects?q=&tag=` | List / search projects |
| GET | `/api/projects/:slug` | Get one project (used by the shareable link) |
| POST | `/api/projects` | Create project (`multipart/form-data`: title, description, internName, tags, liveUrl, repoUrl, images[]) |
| PUT | `/api/projects/:slug` | Update project (header `x-edit-key`) |
| DELETE | `/api/projects/:slug` | Delete project (header `x-edit-key`) |

## How sharing and editing work
- Every project gets a unique slug, so its public link is `/p/<slug>`.
- On creation the server returns a secret `editKey` once. The browser stores it, and it is required to edit or delete. This means "My Projects" only shows projects created in that browser.
- **For production**, replace this with real user accounts (JWT login) and store images in cloud storage (Cloudinary / S3) instead of the local `uploads/` folder.

## Deploying
- Set `CLIENT_URL` in the backend `.env` to your frontend URL.
- Set `VITE_API_URL` in `frontend/.env` to your backend URL, then `npm run build`.
