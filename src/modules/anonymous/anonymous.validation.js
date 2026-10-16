import { z } from "zod"
import { generalValidationFields } from "../../common/validation.js"

export const sendAnonymousMessage = (lang) => {
    return z.object({
        body: z.strictObject({
            receiverId: generalValidationFields.id(lang),
            content: z.string().min(1).max(50000)
        })
    })
}

export const requestIdentity = (lang) => {
    return z.object({
        params: z.strictObject({
            messageId: generalValidationFields.id(lang)
        })
    })
}

export const acceptOrRejectRequest = (lang) => {
    return z.object({
        params: z.strictObject({
            requestId: generalValidationFields.id(lang)
        })
    })
}

export const sendConversationMessage = (lang) => {
    return z.object({
        params: z.strictObject({
            conversationId: generalValidationFields.id(lang)
        }),
        body: z.strictObject({
            content: z.string().min(1).max(50000)
        })
    })
}

export const getConversationMessages = (lang) => {
    return z.object({
        params: z.strictObject({
            conversationId: generalValidationFields.id(lang)
        }),
        query: z.object({
            page: z.string().optional(),
            limit: z.string().optional()
        }).optional()
    })
}