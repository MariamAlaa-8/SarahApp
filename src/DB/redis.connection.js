import { createClient } from "redis"
import { REDIS_URI } from "../config.js"
export const client = createClient({
    url: REDIS_URI
})

client.on("error", (err) => {
    console.error("Redis Client Error:", err)
})
export async function connectRedis() {
    try {
        await client.connect()
        console.log("Redis connection established")
    } catch (error) {
        console.error("Failed to connect to Redis:", error.message)
    }
}