// Environment variable injection for Vercel deployment
// This ensures the API URL is correctly set even if environment variables fail to load

(function() {
  // Force set the API URL for production
  if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname.includes('vercel.app') || 
                        window.location.hostname.includes('netlify.app') ||
                        (!window.location.hostname.includes('localhost') && 
                         !window.location.hostname.includes('127.0.0.1'));
    
    if (isProduction) {
      // Inject environment variables into import.meta.env
      if (typeof import !== 'undefined' && import.meta && import.meta.env) {
        import.meta.env.VITE_API_URL = 'https://hospital-backend-zvjt.onrender.com/api';
        import.meta.env.PROD = true;
        console.log('🔧 Environment variables injected for production');
      }
      
      // Also set as global variable as fallback
      window.__HOSPITAL_API_URL__ = 'https://hospital-backend-zvjt.onrender.com/api';
      console.log('🔧 Global API URL set:', window.__HOSPITAL_API_URL__);
    }
  }
})();