import { UserModel } from "../../DB/models/user.model.js"
import { findByIdAndUpdate } from "../../common/repository/index.js"
import { ConflictException } from "../../common/exceptions/index.js"
import { createLoginCredentials, createRevokeToken, userBaseRevokeTokenKey } from "../../common/security/token.security.js"
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config.js"
import { del, delMultiple, get, keys, set } from "../../common/services/index.js"
import { LogoutEnum } from "../../common/enum/security.enum.js"
export const profile = async (account) => {
    return account
}
export const update = async (user, data) => {
    if (data.username) {
        const [firstname, lastname] = data.username.split(' ') || [];
        data.firstname = firstname;
        data.lastname = lastname;
        delete data.username;
    }
    const account = await findByIdAndUpdate({
        model: UserModel,
        id: user._id,
        update: data
    })
    const cacheKey = `User::${user._id.toString()}:Profile`;
    await del({ key: cacheKey });
    return account;
}
export const rotateToken = async (payload, user, issuer) => {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const currentTime = Date.now()

    if (currentTime < accessExpiresIn) {
        throw ConflictException("Sorry we cannot create new login credentials while current access token still valid")
    }

    const data = await createLoginCredentials({ user, issuer })
    await createRevokeToken({ payload })
    return data
}
export const logout = async (payload, user, options = {}) => {
    const action = options?.action ?? LogoutEnum.DEVICE
    switch (action) {
        case LogoutEnum.ALL: {
            user.changeCredtialsTime = new Date()
            await user.save()
            const prefix = userBaseRevokeTokenKey({ userId: payload.sub })
            const allKeys = await keys({ prefix })
            if (allKeys.length) {
                await delMultiple({ keys: allKeys })
            }
            break
        }
        default: {
            await createRevokeToken({ payload })
            break
        }
    }
    return
}
const PROFILE_CACHE_TTL = 300;  
export const profileCached = async (account) => {
    const userId = account._id.toString();
    const cacheKey = `User::${userId}:Profile`;
    const cachedProfile = await get({ key: cacheKey });
    if (cachedProfile) {
        console.log(" Profile from Redis Cache Hit");
        return cachedProfile;
    }
    console.log(" Profile from MongoDB Cache Miss");
    await set({
        key: cacheKey,
        value: account,
        ttl: PROFILE_CACHE_TTL
    });
    return account;
}