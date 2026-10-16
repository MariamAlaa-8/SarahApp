import { BadException, ConflictException, NotfoundException, TooManyException } from "../../common/exceptions/index.js"
import { createOne, findOne } from "../../common/repository/index.js"
import { UserModel } from "../../DB/models/user.model.js"
import { encryption, decryption } from "../../common/security/encryption.security.js"
import { hash, compare } from "../../common/security/hash.security.js"
import { userBaseRevokeTokenKey, createLoginCredentials } from "../../common/security/token.security.js"
import { WEB_CLIENT_IDs } from "../../config.js"
import { OAuth2Client } from "google-auth-library"
import { EmailSubjectEnum, ProvideEnum } from "../../common/enum/index.js"
import { del, delMultiple, exist, expire, get, incrBy, keys, set, ttl } from "../../common/services/cache.service.js"
import { UserEmailKey, UserOTPTarilsEmailKey } from "../../common/utils/email/send.email.js"
import { emailEvent } from "../../common/events/email.event.js"
import { createOtp } from "../../common/utils/otp.js"
const MAX_ATTEMPTS = 5
const BAN_DURATION = 5 * 60   
const client = new OAuth2Client()
const sendEmailOtp = async ({
    email,
    subject = EmailSubjectEnum.CONFIRM_EMAIL,
    expiresin = 120,
    maxTrails = 3,
    blockInSeconds = 300
}) => {
    const existOtpTTL = await ttl({ key: UserEmailKey({ email, subject }) })
    if (existOtpTTL > 0) {
        throw ConflictException(`Sorry, we cannot request a new OTP while the existing one is valid. Please try again after ${existOtpTTL}s`)
    }

    const currentTrails = await get({ key: UserOTPTarilsEmailKey({ email, subject }) })

    if (currentTrails >= maxTrails) {
        throw TooManyException(`We have reached the OTP limit`)
    }
    const otp = createOtp()
    await set({
        key: UserEmailKey({ email, subject }),
        value: await hash({ plaintext: otp.toString() }),
        ttl: expiresin
    })
    const finalTrails = await incrBy({
        key: UserOTPTarilsEmailKey({ email, subject })
    })
    if (finalTrails == maxTrails) {
        await expire({ key: UserOTPTarilsEmailKey({ email, subject }), ttl: blockInSeconds })
    }
    emailEvent.emit("sendEmail", {
        recipient: { to: email },
        subject,
        data: { code: otp }
    })
}
const verifyGoogleAccount = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_IDs
    })

    const payload = ticket.getPayload()

    if (!payload.email_verified) {
        throw BadException("Email not verified")
    }

    return payload
}

const increaseLoginAttempts = async ({ email }) => {
    const key = `User::${email}::LoginAttempts`
    const attempts = await incrBy({ key, value: 1 })

    if (attempts === 1) {
        await expire({ key, ttl: BAN_DURATION })
    }

    if (attempts >= MAX_ATTEMPTS) {
        await set({
            key: `User::${email}::LoginBlocked`,
            value: "blocked",
            ttl: BAN_DURATION
        })
        throw TooManyException(`Account banned for ${BAN_DURATION / 60} minutes due to too many failed attempts`)
    }
}
export const signup = async ({
    email,
    password,
    username,
    phone,
    gender
} = {}) => {
    const duplicatedAccount = await findOne({
        model: UserModel,
        filter: { email },
        options: { select: "email" }
    })

    if (duplicatedAccount) {
        throw ConflictException("Email Exist")
    }

    const account = new UserModel({
        email,
        password: await hash({ plaintext: password }),
        phone: await encryption(phone),
        gender,
        provider: ProvideEnum.SYSTEM
    })
    account.username = username
    await account.save()
    await sendEmailOtp({
        email,
        subject: EmailSubjectEnum.CONFIRM_EMAIL
    })

    return account
}
export const signupWithGmail = async ({ idToken } = {}, issuer) => {
    const { name, email, picture } = await verifyGoogleAccount(idToken)

    const existAccount = await findOne({
        model: UserModel,
        filter: { email }
    })

    if (existAccount) {
        if (existAccount.provider != ProvideEnum.GOOGLE) {
            throw ConflictException("Invalid account provider")
        }

        return {
            status: 200,
            data: await createLoginCredentials({ user: existAccount, issuer })
        }
    }

    const [firstname, ...rest] = (name || "").split(" ")
    const lastname = rest.join(" ") || firstname

    const user = await createOne({
        model: UserModel,
        data: {
            firstname,
            lastname,
            email,
            confirmEmail: new Date(),
            provider: ProvideEnum.GOOGLE,
            image: picture
        }
    })

    return {
        status: 201,
        data: await createLoginCredentials({ user, issuer })
    }
}
export const login = async ({ email, password } = {}, issuer) => {
    const isBlocked = await exist({ key: `User::${email}::LoginBlocked` })
    if (isBlocked) {
        const blockedTTL = await ttl({ key: `User::${email}::LoginBlocked` })
        throw TooManyException(`Account temporarily banned. Try again after ${blockedTTL}s`)
    }
    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProvideEnum.SYSTEM,
            confirmEmail: { $exists: true }
        }
    })

    if (!user) {
        throw NotfoundException("Not Exist")
    }
    const match = await compare(password, user.password)

    if (!match) {
        await increaseLoginAttempts({ email })
        throw NotfoundException("Not Exist")
    }
    await del({ key: `User::${email}::LoginAttempts` })

    if (user.enable2FA) {
        await sendEmailOtp({
            email,
            subject: EmailSubjectEnum.LOGIN_2FA
        })
        return { message: "OTP sent to your email. Please confirm to receive tokens." }
    }

    user.phone = await decryption(user.phone)
    return await createLoginCredentials({ user, issuer })
}
export const confirmEmail = async ({ email, otp }) => {
    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProvideEnum.SYSTEM,
            confirmEmail: { $exists: false }
        }
    })

    if (!user) {
        throw NotfoundException("Not Exist")
    }

    const hashOtp = await get({
        key: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })
    })

    if (!hashOtp || !await compare(otp, hashOtp)) {
        throw BadException("Invalid OTP")
    }

    user.confirmEmail = new Date()
    await user.save()

    const allKeys = await keys({
        prefix: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })
    })

    if (allKeys.length) {
        await delMultiple({ keys: allKeys })
    }

    return
}
export const reSendconfirmEmail = async ({ email }) => {
    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProvideEnum.SYSTEM,
            confirmEmail: { $exists: false }
        }
    })

    if (!user) {
        throw NotfoundException("Not Exist")
    }

    await sendEmailOtp({
        email,
        subject: EmailSubjectEnum.CONFIRM_EMAIL
    })

    return
}
export const requestForgotPasswordCode = async ({ email }) => {
    const account = await findOne({
        model: UserModel, filter: {
            email,
            provider: ProvideEnum.SYSTEM,
            confirmEmail: { $exists: true }
        }
    })
    if (!account) throw NotfoundException("Fail to find user account");
    await sendEmailOtp({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD })

    return;
}
export const verifyForgotPasswordCode = async ({ otp, email }) => {
    const account = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProvideEnum.SYSTEM,
            confirmEmail: { $exists: true }
        }
    })
    if (!account) throw NotfoundException("Fail to find user account");

    const hashOtp = await get({
        key: UserEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD })
    })

    if (!hashOtp || !await compare(otp, hashOtp)) {
        throw ConflictException("Invalid otp")
    }

    return account;
}

export const resetForgotPassword = async ({ otp, email, password }) => {
    const account = await verifyForgotPasswordCode({ otp, email })

    account.password = await hash({ plaintext: password })
    account.changeCredtialsTime = new Date()
    await account.save()

    const result = await Promise.all([
        keys({ prefix: userBaseRevokeTokenKey({ userId: account._id }) }),
        keys({ prefix: UserEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD }) })
    ])

    await delMultiple({ keys: [...result[0], ...result[1]] })

    return
}
export const enable2FA = async ({ email }) => {
    const user = await findOne({
        model: UserModel,
        filter: { email, confirmEmail: { $exists: true } }
    })

    if (!user) {
        throw NotfoundException("Not Exist")
    }

    if (user.enable2FA) {
        throw ConflictException("2FA is already enabled")
    }

    await sendEmailOtp({
        email,
        subject: EmailSubjectEnum.ENABLE_2FA
    })

    return { message: "OTP sent to your email to confirm enabling 2FA" }
}
export const verifyEnable2FA = async ({ email, otp }) => {
    const user = await findOne({
        model: UserModel,
        filter: { email, confirmEmail: { $exists: true } }
    })
    if (!user) {
        throw NotfoundException("Not Exist")
    }
    const hashOtp = await get({
        key: UserEmailKey({ email, subject: EmailSubjectEnum.ENABLE_2FA })
    })
    if (!hashOtp || !await compare(otp, hashOtp)) {
        throw BadException("Invalid OTP")
    }

    user.enable2FA = true
    await user.save()

    await del({
        key: UserEmailKey({ email, subject: EmailSubjectEnum.ENABLE_2FA })
    })
    return { message: "2FA enabled successfully" }
}

export const confirmLogin2FA = async ({ email, otp } = {}, issuer) => {
    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProvideEnum.SYSTEM,
            confirmEmail: { $exists: true },
            enable2FA: true
        }
    })

    if (!user) {
        throw NotfoundException("Not Exist or 2FA not enabled")
    }

    const hashOtp = await get({
        key: UserEmailKey({ email, subject: EmailSubjectEnum.LOGIN_2FA })
    })

    if (!hashOtp || !await compare(otp, hashOtp)) {
        throw BadException("Invalid OTP")
    }
    await del({
        key: UserEmailKey({ email, subject: EmailSubjectEnum.LOGIN_2FA })
    })
    user.phone = await decryption(user.phone)
    return await createLoginCredentials({ user, issuer })
}