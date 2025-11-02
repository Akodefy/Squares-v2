# Deployment Configuration

## Backend (Render)
Your backend is deployed at: https://squares-9d84.onrender.com

### Environment Variables for Render:
- Copy all variables from `server/.env.production`
- Make sure to update `CLIENT_URL=https://squares-swart.vercel.app`
- Set `MONGODB_URI` to your production MongoDB connection string

## Frontend (Vercel)
Your frontend is deployed at: https://squares-swart.vercel.app

### Environment Variables for Vercel:
Add these in your Vercel project settings:

```bash
VITE_API_URL=https://squares-9d84.onrender.com/api
VITE_API_BASE_URL=https://squares-9d84.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
```

## Local Development
For local development, the app will automatically fallback to:
- Backend: http://localhost:8000/api
- Frontend: http://localhost:8001

Create a `.env.local` file (copy from `.env.example`) to override defaults locally.

## Testing URLs
- Local Frontend: http://localhost:8001
- Local Backend: http://localhost:8000
- Production Frontend: https://squares-swart.vercel.app
- Production Backend: https://squares-9d84.onrender.com
