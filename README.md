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

## Environment variables
Create a `.env` file in the `backend/` folder (you can copy `.env.example`) and set the following values:

```
MONGODB_URI=mongodb://localhost:27017/monuvista
JWT_SECRET=your_strong_jwt_secret
PORT=5000
```

## GitHub CI
This repository includes basic GitHub Actions workflows under `.github/workflows/`:
- `frontend-ci.yml` — installs dependencies and builds the frontend on push/PR for the `frontend/` folder.
- `backend-ci.yml` — installs backend dependencies and runs basic checks on push/PR for the `backend/` folder.

## License
This project is licensed under the MIT License. See `LICENSE`.

## Next steps
- Create a GitHub repo and push this project.
- Add CI and environment variable handling for production.
