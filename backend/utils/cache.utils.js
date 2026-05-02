import redisClient from "../Services/Connections/redis.connection.js";

export async function getCache(key) {
  if (!redisClient.isOpen) return null;
  const cacheValue = await redisClient.get(key);
  return cacheValue ? JSON.parse(cacheValue) : null;
}

export async function setCache(key, value, ttlSeconds = 3600) {
  if (!redisClient.isOpen) return;
  const payload = JSON.stringify(value);
  await redisClient.set(key, payload, { EX: ttlSeconds });
}

export function cacheResponse(keyResolver, ttlSeconds = 3600) {
  return async (req, res, next) => {
    const cacheKey = keyResolver(req);
    if (!cacheKey) return next();

    const cachedResponse = await getCache(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      await setCache(cacheKey, body, ttlSeconds);
      originalJson(body);
    };

    next();
  };
}
