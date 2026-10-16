import { z } from "zod"
import { generalValidationFields } from "../../common/validation.js"
export const loginBodySchema = (lang) => {
    return z.object({
        email: generalValidationFields.email(lang),
        password: generalValidationFields.password(lang),
    })
}
export const login = (lang) => {
    return z.object({
        body: loginBodySchema(lang),
    })
}
export const signup = (lang) => {
    return z.object({
        body: loginBodySchema(lang).extend({
            username: generalValidationFields.username(lang),
            phone: generalValidationFields.phone(lang),
            confirmPassword: generalValidationFields.password(lang),
        }).superRefine((data, ctx) => {
            generalValidationFields.matchFields({
                original: "password",
                copy: "confirmPassword",
                data, ctx, lang
            })
        })
    })
}
export const confirmEmail = (lang) => {
    return z.object({
        body: z.strictObject({
            otp: generalValidationFields.otp(lang),
            email: generalValidationFields.email(lang),
        
        })
    })
}
export const resendconfirmEmail = (lang) => {
    return z.object({
        body: z.strictObject({
            
            email: generalValidationFields.email(lang),
        
        })
    })
}
export const signupWithGmail = (lang) => {
    return z.object({
        body: z.object({
            idToken: z.string().min(20, "Invalid Google ID token")
        }).strict()
    })
}
export const enable2FA = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang)
        })
    })
}
export const verifyEnable2FA = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang)
        })
    })
}
export const confirmLogin2FA = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang)
        })
    })
}
export const resetForgotPassword = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang),
            password: generalValidationFields.password(lang)
        })
    })
}