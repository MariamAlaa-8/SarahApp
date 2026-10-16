import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import {ACCESS_ADMIN_TOKEN_SIGNATURE,ACCESS_TOKEN_EXPIRES_IN,ACCESS_USER_TOKEN_SIGNATURE,REFRESH_ADMIN_TOKEN_SIGNATURE,REFRESH_TOKEN_EXPIRES_IN,REFRESH_USER_TOKEN_SIGNATURE} from '../../config.js'
import { BadException, NotfoundException, UnauthorizedException } from '../exceptions/error.exception.js'
import { findById, findOne } from '../repository/base.repository.js'
import { UserModel } from '../../DB/models/user.model.js'
import { TokenTypeEnum } from '../enum/security.enum.js'
import { ROLEENUM } from '../enum/user.gender.js'
import { compare } from './hash.security.js'
import { exist, set } from '../services/index.js'
export const userBaseKey = ({ userId }) => {
    return `User::${userId.toString()}`
}
export const userBaseRevokeTokenKey = ({ userId }) => {
    return `${userBaseKey({ userId })}:Revoke_Token`
}
export const userRevokeTokenKey = ({ userId, jti }) => {
    return `${userBaseRevokeTokenKey({ userId })}::${jti}`
}
export const createToken = async ({
    payload = {},
    options = {},
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return await jwt.sign(payload, secret, options)
}
export const verifyToken = async ({
    token = "",
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return await jwt.verify(token, secret)
}
const getTokenSignatures = async ({
    role = ROLEENUM.USER
} = {}) => {
    let signatures

    role = Number(role)

    switch (role) {
        case ROLEENUM.ADMIN: {
            signatures = {
                accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE,
                refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE
            }
            break
        }
        default: {
            signatures = {
                accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
                refreshSignature: REFRESH_USER_TOKEN_SIGNATURE
            }
            break
        }
    }
    return signatures
}
const getSignature = async ({
    tokenType = TokenTypeEnum.ACCESS,
    role = ROLEENUM.USER
} = {}) => {
    const signatures = await getTokenSignatures({ role })

    if (tokenType == TokenTypeEnum.ACCESS) {
        return signatures.accessSignature
    }

    return signatures.refreshSignature
}
export const decodeToken = async ({
    authorization = "",
    tokenType = TokenTypeEnum.ACCESS
} = {}) => {
    const decoded = jwt.decode(authorization)
    if (!decoded?.aud?.length) {
        throw BadException("Missing token payload")
    }
    const payload = await verifyToken({
        token: authorization,
        secret: await getSignature({ tokenType, role: decoded.aud[0] })
    })
    if (!payload?.sub) {
        throw BadException("Missing token payload")
    }
    if (await exist({ key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {
        throw UnauthorizedException("Expired login credentials")
    }
    const user = await findById({
        model: UserModel,
        id: payload.sub
    })
    if (!user) {
        throw NotfoundException("Invalid user")
    }
    if ((user.changeCredtialsTime?.getTime() ?? 0) > payload.iat * 1000) {
        throw UnauthorizedException("Expired login credentials")
    }
    return { user, payload }
}
export const createLoginCredentials = async ({
    user = {},
    issuer,
    options = {}
} = {}) => {
    const { accessSignature, refreshSignature } = await getTokenSignatures({ role: user.role })
    const jwtid = randomUUID()
    const access_token = await createToken({
        payload: { sub: user._id },
        secret: accessSignature,
        options: {
            ...options,
            issuer,
            audience: [String(user.role)],
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            jwtid
        }
    })
    const refresh_token = await createToken({
        payload: { sub: user._id },
        secret: refreshSignature,
        options: {
            ...options,
            issuer,
            audience: [String(user.role)],
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
            jwtid
        }
    })
    return { access_token, refresh_token }
}
export const createRevokeToken = async ({ payload }) => {
    const now = Math.ceil(Date.now() / 1000)
    const refreshExpiresAt = payload.iat + REFRESH_TOKEN_EXPIRES_IN
    const ttl = refreshExpiresAt - now

    await set({
        key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }),
        value: payload.jti,
        ttl
    })
    return
}
export const basicAuth = async ({
    email,
    password
} = {}) => {
    const user = await findOne({
        model: UserModel,
        filter: { email },
    })
    if (!user) {
        throw NotfoundException("Not Exist")
    }
    const match = await compare(password, user.password)
    if (!match) {
        throw NotfoundException("Not Exist")
    }
    return user
}