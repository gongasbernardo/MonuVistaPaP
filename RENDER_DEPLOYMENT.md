# Render Deployment Guide

## Frontend Deployment Setup

The MonuVista frontend is configured to deploy to Render as a Node.js web service.

### Prerequisites
- Render account
- GitHub repository connected to Render
- Backend API deployed (or have the backend URL)

### Environment Variables

Set the following environment variable in your Render dashboard:

- **VITE_API_URL**: URL of your backend API (e.g., `https://monuvista-backend.onrender.com`)
  - This is pre-configured in `render.yaml` but can be overridden in the Render dashboard

### How It Works

1. **Build**: Runs `npm install && npm run build`
   - Compiles TypeScript
   - Builds optimized React application with Vite
   - Output goes to `dist/` directory

2. **Start**: Runs `node server.js`
   - Express server serves the built React app
   - Handles SPA routing (all routes serve `index.html`)
   - Listens on port specified by Render (via `PORT` environment variable)

### Manual Deployment

To test locally before deploying:

```bash
npm install
npm run build
npm start
```

The frontend will be available at `http://localhost:3000`

### Troubleshooting

- **Build fails**: Check that all TypeScript compiles (`npm run build` works locally)
- **Routes not working**: The server is configured to handle SPA routing properly
- **API calls fail**: Verify `VITE_API_URL` environment variable is set correctly in Render dashboard
- **Port issues**: Ensure no other services are using port 3000

### File Structure

- `src/` - React source code
- `dist/` - Built production files (generated during build)
- `server.js` - Express server for serving the SPA
- `vite.config.ts` - Vite build configuration
- `render.yaml` - Render deployment configuration

### Notes

- The `.env.example` file documents required environment variables
- Socket.io-client is configured for real-time communication with the backend
- Leaflet/React Leaflet is used for map functionality
