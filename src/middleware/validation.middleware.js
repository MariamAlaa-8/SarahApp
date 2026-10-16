import { LanguageEnum } from "../common/enum/security.enum.js"
import { BadException } from "../common/exceptions/index.js"
export const validation = (schema) => {
    return (req, res, next) => {
        const lang =Number(req.headers['accept-language']??LanguageEnum.EN)
        try {
            const validationResult = schema(lang).safeParse(
                {
                    body:req.body,
                     query:req.query,
                    params:req.params,
                       headers:req.headers,
                           files:req.files,
                           file:req.file,
                   
                }
            )
            if (!validationResult.success) {
                throw BadException("Validation Error", {
                    issues: validationResult.error.issues
                })
            }
            req.validatedBody = validationResult.data
            next()
        } catch (error) {
            next(error)
        }
    }
}