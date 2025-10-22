# Ninety Nine Acres - Real Estate Platform

## Deployment Configuration

This project is configured for Vercel deployment with the following optimizations:

### Build Settings
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Environment Variables Required:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_backend_api_url
VITE_API_BASE_URL=your_backend_base_url
```

### SPA Routing
The `vercel.json` configuration handles all client-side routes by redirecting them to `/index.html`.

### File Structure
- All static assets are in `/assets/`
- Public files like robots.txt are served from root
- React Router handles all application routing

### Cache Headers
- Static assets are cached for 1 year
- JavaScript and CSS files are cached with immutable flag