# MonuVista

MonuVista is a prototype app for monument discovery and community features (frontend in React + Ionic, backend in Node/Express + MongoDB).

## Tech stack
- Frontend: React 18, Ionic, TypeScript, Vite
- Backend: Node.js, Express, MongoDB (Mongoose)

## Quick start (local)

Prerequisites: Node.js (16+), npm, MongoDB running locally or a connection string.

Backend

```bash
cd backend
npm install
# create a .env file (see .env.example) with MONGODB_URI and JWT_SECRET
npm run dev
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes
- Some features are prototypes or simulated (e.g. monument recognition and album service uses localStorage). See project files for details.
- Configure backend URL in frontend API calls if deploying.

## Next steps
- Create a GitHub repo and push this project.
- Add CI and environment variable handling for production.
