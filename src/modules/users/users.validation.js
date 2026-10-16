import { z } from "zod"
import { generalValidationFields } from "../../common/validation.js"
export const updateProfile = (lang) => {
    return z.object({
        username: generalValidationFields.username(lang).optional(),
        email: generalValidationFields.email(lang).optional(),
        phone: generalValidationFields.phone(lang).optional(),
        gender: generalValidationFields.gender(lang).optional(),
        DOB: z.string()
            .refine((val) => !isNaN(Date.parse(val)), {
                message: lang === 0
                    ? "صيغة التاريخ غير صحيحة"
                    : "Invalid date format"
            })
            .optional(),
        image: z.string().url({
            message: lang === 0
                ? "رابط الصورة غير صحيح"
                : "Invalid image URL"
        }).optional(),
        coverImage: z.array(
            z.string().url({
                message: lang === 0
                    ? "رابط الصورة غير صحيح"
                    : "Invalid cover image URL"
            })
        ).optional()
    }).strict()
}