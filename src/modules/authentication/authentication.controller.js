import { Router } from "express"
import {confirmEmail, confirmLogin2FA, enable2FA,login, requestForgotPasswordCode, reSendconfirmEmail,resetForgotPassword,signup,signupWithGmail,verifyEnable2FA, verifyForgotPasswordCode} from "./authentication.service.js"
import { generateLimiter, successResponse } from "../../common/utils/index.js"
import * as validators from './authentication.validation.js'
import { validation } from "../../middleware/validation.middleware.js"
import { authentication } from "../../middleware/authentication.middleware.js"
const router = Router({caseSensitive:true,strict:true})
router.post("/signup",
    validation(validators.signup),
    async (req, res, next) => {
        try {
            const data = await signup(req.validatedBody.body)
            return successResponse({ res, status: 201, data })
        } catch (error) {
            next(error)
        }
    }
)
router.post("/request-forgot-password-code", validation(validators.resendconfirmEmail), async (req, res, next) => {
    const data = await requestForgotPasswordCode(req.body)
    return successResponse({ res, status: 201, data })
})

router.post("/verify-forgot-password", validation(validators.confirmEmail), async (req, res, next) => {
    const data = await verifyForgotPasswordCode(req.body)
    return successResponse({ res, status: 200, data })
})

router.patch("/reset-forgot-password", validation(validators.resetForgotPassword), async (req, res, next) => {
    try {
        const data = await resetForgotPassword(req.body)
        return successResponse({ res, status: 200, data })
    } catch (error) {
        next(error)
    }
})
router.post("/signup-with-gmail",
    validation(validators.signupWithGmail),
    async (req, res, next) => {
        try {
            const issuer = `${req.protocol}://${req.host}`
            const { status, data } = await signupWithGmail(req.validatedBody.body, issuer)
            return successResponse({ res, status, data })
        } catch (error) {
            next(error)
        }
    }
)
router.patch("/confirm-email",
    validation(validators.confirmEmail),
    async (req, res, next) => {
        try {
            const data = await confirmEmail(req.validatedBody.body)
            return successResponse({ res, status: 200, data })
        } catch (error) {
            next(error)
        }
    }
)
router.patch("/resend-confirm-email",
    validation(validators.resendconfirmEmail),
    async (req, res, next) => {
        try {
            const data = await reSendconfirmEmail(req.validatedBody.body)
            return successResponse({ res, status: 200, data })
        } catch (error) {
            next(error)
        }
    }
)
const loginLimiter = generateLimiter({ ttl: 1, limit: 1000 })
router.post("/login",
    validation(validators.login),
    loginLimiter,
    async (req, res, next) => {
        try {
            const issuer = `${req.protocol}://${req.host}`
            const data = await login(req.validatedBody.body, issuer)
           // await del({key:req.rateLimit.Key})
            return successResponse({ res, data })
            
        } catch (error) {
            next(error)
        }
    }
)
router.post("/2fa/enable",
    authentication(),
    validation(validators.enable2FA),
    async (req, res, next) => {
        try {
            const data = await enable2FA(req.validatedBody.body)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)
router.post("/2fa/verify",
    authentication(),
    validation(validators.verifyEnable2FA),
    async (req, res, next) => {
        try {
            const data = await verifyEnable2FA(req.validatedBody.body)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)
router.post("/2fa/login/confirm",
    validation(validators.confirmLogin2FA),
    async (req, res, next) => {
        try {
            const issuer = `${req.protocol}://${req.host}`
            const data = await confirmLogin2FA(req.validatedBody.body, issuer)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)
export default router