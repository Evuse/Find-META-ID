import express from 'express';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API Route to extract Facebook Page ID
  app.post('/api/extract-id', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      // Basic URL parsing first
      const urlObj = new URL(url);
      
      // If the URL already contains the ID in the query string
      if (urlObj.searchParams.has('id')) {
        return res.json({ id: urlObj.searchParams.get('id') });
      }

      // Fetch the page HTML
      const response = await fetch(urlObj.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      // Regex patterns to find the ID in the HTML source code
      const patterns = [
        /"pageID":"(\d+)"/,
        /"page_id":"(\d+)"/,
        /fb:\/\/page\/\?id=(\d+)/,
        /al:ios:url"\s+content="fb:\/\/page\/\?id=(\d+)/,
        /"entity_id":"(\d+)"/,
        /"identifier":"(\d+)"/,
        /content="fb:\/\/profile\/(\d+)"/,
        /page_id=(\d+)/
      ];

      let extractedId = null;
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          extractedId = match[1];
          break;
        }
      }

      if (extractedId) {
        res.json({ id: extractedId });
      } else {
        res.status(404).json({ error: 'Impossibile trovare l\'ID della pagina. Assicurati che sia una URL valida di una Pagina Facebook pubblica.' });
      }
    } catch (error) {
      console.error('Error fetching URL:', error);
      res.status(500).json({ error: 'Errore durante l\'elaborazione dell\'URL. Verifica che il link sia corretto e riprova.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the static files from dist
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
