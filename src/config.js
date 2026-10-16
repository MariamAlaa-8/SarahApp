import { resolve } from 'node:path'
import { config } from 'dotenv'
export const NODE_ENV = process.env.NODE_ENV ?? 'development'
config({ path: resolve(`.env.${NODE_ENV}`) })
export const PORT = parseInt(process.env.PORT ?? "3000")
export const DB_URI = process.env.DB_URI
export const REDIS_URI = process.env.REDIS_URI
export const ENC_KEY = Buffer.from(
  process.env.ENC_KEY ?? "12345678901234567890123456789012",
  "utf-8"
).subarray(0, 32)

export const IV_LENGTH = 16
export const SALT = parseInt(process.env.SALT ?? "10")

export const ACCESS_ADMIN_TOKEN_SIGNATURE = process.env.ACCESS_ADMIN_TOKEN_SIGNATURE
export const ACCESS_USER_TOKEN_SIGNATURE = process.env.ACCESS_USER_TOKEN_SIGNATURE
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1800")

export const REFRESH_ADMIN_TOKEN_SIGNATURE = process.env.REFRESH_ADMIN_TOKEN_SIGNATURE
export const REFRESH_USER_TOKEN_SIGNATURE = process.env.REFRESH_USER_TOKEN_SIGNATURE
export const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "31536000")

export const WEB_CLIENT_IDs = (process.env.WEB_CLIENT_IDs ?? "").split(",").filter(Boolean)

export const ORIGINS = (process.env.ORIGINS ?? "").split(",").filter(Boolean)
export const APP_PASSWORD = process.env.APP_PASSWORD
export const APP_EMAIL = process.env.APP_EMAIL