import { z } from "zod"

export const createMessage = (lang) => {
    return z.object({
        body: z.object({
            content: z.string().min(1).max(50000).optional(),
            receiverId: z.string().min(1, "Receiver Id is required")
        }).strict()
    })
}

export const allMessage = (lang) => {
    return z.object({
        query: z.object({
            page: z.string().optional(),
            limit: z.string().optional()
        }).optional()
    })
}

export const deleteMessage = (lang) => {
    return z.object({
        params: z.object({
            messageId: z.string().min(1)
        }).strict()
    })
}