import { Router } from "express"
import { fileValidation, localFileUpload, successResponse } from "../../common/utils/index.js"
import { createMessage, deleteMessage, getallMessages, getMessage } from "./message.service.js"
import { authentication } from "../../middleware/authentication.middleware.js"
import { bearerAuth } from "../../middleware/authentication.middleware.js"
import { uploadMiddleware } from "../../middleware/multer.middleware.js"
import { validation } from "../../middleware/validation.middleware.js"
import * as validators from "./message.validation.js"

const router = Router()
const messageFolderName = "messages"

router.post("/",
    async (req, res, next) => {
        if (req.headers['authorization']) {
            await bearerAuth({ req })
        }
        next()
    },
    uploadMiddleware({
        multerMiddleware: localFileUpload().any("attachments", 3),
        validation: fileValidation.Image,
        custompath: messageFolderName,
        isRequired: false
    }),
    validation(validators.createMessage),
    async (req, res, next) => {
        try {
            const data = await createMessage(req.body, req.files)
            return successResponse({ res, status: 201, data })
        } catch (error) {
            next(error)
        }
    }
)

router.get("/",
    authentication(),
    validation(validators.allMessage),
    async (req, res, next) => {
        try {
            const data = await getallMessages(req.validatedBody.query, req.user)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)

router.get("/:messageId",
    authentication(),
    validation(validators.deleteMessage),
    async (req, res, next) => {
        try {
            const data = await getMessage(req.validatedBody.params, req.user)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)

router.delete("/:messageId",
    authentication(),
    validation(validators.deleteMessage),
    async (req, res, next) => {
        try {
            const data = await deleteMessage(req.validatedBody.params, req.user)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)

export default router