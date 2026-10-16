import { Router } from "express"
import { successResponse } from "../../common/utils/index.js"
import { authentication } from "../../middleware/authentication.middleware.js"
import { validation } from "../../middleware/validation.middleware.js"
import * as validators from "./anonymous.validation.js"
import {
    sendAnonymousMessage,
    requestIdentity,
    getRequests,
    acceptRequest,
    rejectRequest,
    sendConversationMessage,
    getConversationMessages,
    getMyConversations
} from "./anonymous.service.js"

const router = Router()

router.post("/messages/anonymous",
    authentication(),
    validation(validators.sendAnonymousMessage),
    async (req, res, next) => {
        try {
            const data = await sendAnonymousMessage(req.validatedBody.body, req.user._id)
            return successResponse({ res, status: 201, data })
        } catch (error) {
            next(error)
        }
    }
)

router.post("/messages/:messageId/request-identity",
    authentication(),
    validation(validators.requestIdentity),
    async (req, res, next) => {
        try {
            const data = await requestIdentity(req.validatedBody.params, req.user._id)
            return successResponse({ res, status: 201, data })
        } catch (error) {
            next(error)
        }
    }
)

router.get("/requests",
    authentication(),
    async (req, res, next) => {
        try {
            const data = await getRequests(req.user._id, req.query)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)

router.patch("/requests/:requestId/accept",
    authentication(),
    validation(validators.acceptOrRejectRequest),
    async (req, res, next) => {
        try {
            const data = await acceptRequest(req.validatedBody.params, req.user._id)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)

router.patch("/requests/:requestId/reject",
    authentication(),
    validation(validators.acceptOrRejectRequest),
    async (req, res, next) => {
        try {
            const data = await rejectRequest(req.validatedBody.params, req.user._id)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)

router.get("/conversations",
    authentication(),
    async (req, res, next) => {
        try {
            const data = await getMyConversations(req.user._id)
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)

router.post("/conversations/:conversationId/messages",
    authentication(),
    validation(validators.sendConversationMessage),
    async (req, res, next) => {
        try {
            const data = await sendConversationMessage(
                { conversationId: req.validatedBody.params.conversationId, content: req.validatedBody.body.content },
                req.user._id
            )
            return successResponse({ res, status: 201, data })
        } catch (error) {
            next(error)
        }
    }
)

router.get("/conversations/:conversationId/messages",
    authentication(),
    validation(validators.getConversationMessages),
    async (req, res, next) => {
        try {
            const data = await getConversationMessages(
                req.validatedBody.params,
                req.user._id,
                req.validatedBody.query
            )
            return successResponse({ res, data })
        } catch (error) {
            next(error)
        }
    }
)

export default router