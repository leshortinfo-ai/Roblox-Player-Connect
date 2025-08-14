const store = new Map();

export function cacheMiddleware(ttlSecondsDefault=60) {
  const ttl = Number(process.env.CACHE_TTL || ttlSecondsDefault);
  return (req, res, next) => {
    const key = req.method + ':' + req.originalUrl + (req.method === 'POST' ? ':' + JSON.stringify(req.body||{}) : '');
    const hit = store.get(key);
    const now = Date.now();
    if (hit && hit.expires > now) {
      res.set('X-Cache', 'HIT');
      return res.json(hit.data);
    }
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      store.set(key, { data, expires: now + ttl * 1000 });
      res.set('Cache-Control', `public, max-age=${ttl}`);
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };
    next();
  };
}