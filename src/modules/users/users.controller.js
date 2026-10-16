import { Router } from "express"
import { successResponse } from "../../common/utils/index.js"
import { logout, profileCached, rotateToken, update } from "./user.service.js"
import { authentication, authorization } from "../../middleware/authentication.middleware.js"
import { TokenTypeEnum } from "../../common/enum/security.enum.js"
import { ROLEENUM } from "../../common/enum/user.gender.js"
import { fileValidation, localFileUpload } from "../../common/utils/multer/local.multer.js"
import { uploadMiddleware } from "../../middleware/multer.middleware.js"
const router = Router({mergeParams:true})
router.get("/data/:x",
  
    async (req, res, next) => {
        
            
            return successResponse({ res })
      
    }
)
router.patch("/profile-image",
    authentication(),
    uploadMiddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({ maxFileSize: 2 }).single("attachment"),
        custompath: "users",
        validation: fileValidation.Image
    }),
    async (req, res, next) => {
        try {
            req.user.image = req.file.filepath
            await req.user.save()
            return successResponse({ res, data: { user: req.user } })
        } catch (error) {
            next(error)
        }
    }
)
router.get("/",
    authentication(),
    async (req, res, next) => {
        try {
            const data = await profileCached(req.user)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)
router.patch("/",
    authentication(),
    authorization([ROLEENUM.USER, ROLEENUM.ADMIN]),
    async (req, res, next) => {
        try {
            const data = await update(req.user, req.body)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)
router.post("/rotate-token",
    authentication(TokenTypeEnum.REFRESH),
    async (req, res, next) => {
        try {
            const issuer = `${req.protocol}://${req.host}`
            const data = await rotateToken(req.payload, req.user, issuer)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)
router.post("/logout",
    authentication(),
    async (req, res, next) => {
        try {
            const data = await logout(req.payload, req.user, req.body)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)
export default router