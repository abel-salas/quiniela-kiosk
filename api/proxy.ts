/**
 * Vercel Serverless Function para proxy de peticiones a SELAE.
 *
 * Objetivo: Evitar errores 406/403 de Akamai al añadir headers completos
 * y ejecutar las peticiones desde el servidor de Vercel en lugar del browser.
 *
 * Uso: GET /api/proxy?url=<encoded-url>
 *
 * Headers añadidos:
 * - User-Agent: Simula un navegador real
 * - Accept-Language: Español
 * - Accept: application/json
 */

export default async function handler(req: any, res: any) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = req.query.url as string;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-cache',
    });

    const data = await response.text();

    // Forward status and headers
    res.status(response.status);

    // Forward important headers
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('content-type', contentType);
    }

    // Add CORS headers para permitir acceso desde el frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Proxy request failed' });
  }
}
