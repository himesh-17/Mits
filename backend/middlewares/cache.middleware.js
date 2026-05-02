import redisClient from "../Services/Connections/redis.connection.js";

const getCacheKey = (req) => {
  const userSegment = req.user?.id ? `user:${req.user.id}` : "anon";
  return `${req.method}:${req.originalUrl}:${userSegment}`;
};

export async function cacheGetRequests(req, res, next) {
  if (req.method !== "GET") {
    return next();
  }

  const cacheKey = getCacheKey(req);
  const cachedBody = await redisClient.get(cacheKey);
  if (cachedBody) {
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(JSON.parse(cachedBody));
  }

  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (res.headersSent === false && res.statusCode >= 200 && res.statusCode < 300) {
      await redisClient.set(cacheKey, JSON.stringify(body), { EX: 3600 });
      res.setHeader("X-Cache", "MISS");
    }
    originalJson(body);
  };

  next();
}

export async function invalidateCacheOnWrite(req, res, next) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    try {
      await redisClient.flushDb();
    } catch (error) {
      console.warn("Could not flush Redis cache on write request:", error);
    }
  }
  next();
}
