import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import geoip from 'geoip-lite'
import { successResponse } from './success.response.js'
import { client } from '../../DB/redis.connection.js'

function fromWhere(ip) {
    try {
        return geoip.lookup(ip)
    } catch (error) {
        return undefined
    }
}

export const generateLimiter = (
    ttl = 15,
    message = "Too many requests",
    status = 429,
    legacyHeaders = false,
    standardHeaders = false,
    skipSuccessfulRequests,
    skipFailedRequests,
    limit = 1000
) => {
    return rateLimit({
        windowMs: ttl * 60 * 1000,
        limit: function (req) {
            const date = fromWhere(req.ip)
            return date?.country == "EG" ? limit : limit
        },
        legacyHeaders,
        standardHeaders,
        skipSuccessfulRequests,
        skipFailedRequests,
        message: "max",
        handler: function (req, res, next) {
            return successResponse({ res, status: 429, message })
        },
        keyGenerator: function (req) {
            const ip = ipKeyGenerator(req.ip, 56)
            return `${ip}::${req.path}`
        },
        store: {
            async incr(key, cb) {
                try {
                    const count = await client.incr(key)
                    if (count === 1) {
                        await client.expire(key, ttl * 60)
                    }
                    cb(null, count)
                } catch (error) {
                    cb(error)
                }
            },
            async decrement(key) {
                if (await client.exists(key)) {
                    await client.decr(key)
                }
            },
        },
    })
}