import { createApiMiddleware } from '../server/apiMiddleware.js';

const middleware = createApiMiddleware();

export default function handler(req, res) {
  return new Promise((resolve) => {
    // Si Vercel ya parseó el body en req.body (objeto), permitir que middleware lo use
    if (req.body && typeof req.body === 'object') {
      req.parsedBody = req.body;
    }
    
    middleware(req, res, () => {
      if (!res.writableEnded) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Endpoint API no encontrado en producción' }));
      }
      resolve();
    });
  });
}

