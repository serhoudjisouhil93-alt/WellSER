import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  if (process.env.NODE_ENV !== 'production') {
    // Mode Développement avec Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Mode Production
    const distPath = __dirname.endsWith('dist') ? __dirname : path.resolve(__dirname, 'dist');
    const indexPath = path.resolve(distPath, 'index.html');
    
    app.use(express.static(distPath));
    
    app.all('*', (req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application non compilée. Veuillez lancer 'npm run build'.");
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WellSER running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Erreur au démarrage du serveur:', err);
});
