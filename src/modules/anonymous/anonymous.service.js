import {
    BadException,
    ConflictException,
    ForbiddenException,
    NotfoundException
} from "../../common/exceptions/index.js"
import { MessageModel } from "../../DB/models/message.model.js"
import { IdentityRequestModel } from "../../DB/models/identityRequest.model.js"
import { ConversationModel } from "../../DB/models/conversation.model.js"
import { ConversationMessageModel } from "../../DB/models/conversationMessage.model.js"
import { UserModel } from "../../DB/models/user.model.js"

const findUserById = async (id) => {
    return await UserModel.findById(id)
}

export const sendAnonymousMessage = async ({ receiverId, content }, senderId) => {
    if (receiverId === senderId.toString()) {
        throw BadException("You cannot send a message to yourself")
    }

    const receiver = await findUserById(receiverId)
    if (!receiver) {
        throw NotfoundException("Receiver not found")
    }

    const message = await MessageModel.create({
        senderId,
        receiverId,
        content,
        isAnonymous: true
    })

    return message
}

export const requestIdentity = async ({ messageId }, requesterId) => {
    const message = await MessageModel.findById(messageId)
    if (!message) {
        throw NotfoundException("Message not found")
    }

    if (message.receiverId.toString() !== requesterId.toString()) {
        throw ForbiddenException("You can only request identity for messages you received")
    }

    if (!message.isAnonymous) {
        throw BadException("This message is not anonymous")
    }

    const existingRequest = await IdentityRequestModel.findOne({
        messageId,
        requesterId
    })

    if (existingRequest) {
        throw ConflictException("You already requested the identity for this message")
    }

    const request = await IdentityRequestModel.create({
        messageId,
        requesterId,
        senderId: message.senderId,
        status: "pending"
    })

    return request
}

export const getRequests = async (senderId, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit

    const requests = await IdentityRequestModel.find({ senderId })
        .populate("requesterId", "firstname lastname username email")
        .populate("messageId", "content")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })

    const count = await IdentityRequestModel.countDocuments({ senderId })

    return {
        count,
        limit: Number(limit),
        pages: Math.ceil(count / limit),
        currentPage: Number(page),
        requests
    }
}
export const acceptRequest = async ({ requestId }, senderId) => {
    const request = await IdentityRequestModel.findById(requestId)
    if (!request) {
        throw NotfoundException("Request not found")
    }

    if (request.senderId.toString() !== senderId.toString()) {
        throw ForbiddenException("You can only respond to requests sent to you")
    }

    if (request.status !== "pending") {
        throw ConflictException(`Request is already ${request.status}`)
    }

    request.status = "accepted"
    request.respondedAt = new Date()
    await request.save()

    const existingConversation = await ConversationModel.findOne({
        messageId: request.messageId
    })

    let conversation = existingConversation

    if (!existingConversation) {
        conversation = await ConversationModel.create({
            messageId: request.messageId,
            participants: [request.senderId, request.requesterId]
        })
    }

    return { request, conversation }
}

export const rejectRequest = async ({ requestId }, senderId) => {
    const request = await IdentityRequestModel.findById(requestId)
    if (!request) {
        throw NotfoundException("Request not found")
    }

    if (request.senderId.toString() !== senderId.toString()) {
        throw ForbiddenException("You can only respond to requests sent to you")
    }

    if (request.status !== "pending") {
        throw ConflictException(`Request is already ${request.status}`)
    }

    request.status = "rejected"
    request.respondedAt = new Date()
    await request.save()

    return request
}

export const sendConversationMessage = async ({ conversationId, content }, senderId) => {
    const conversation = await ConversationModel.findById(conversationId)
    if (!conversation) {
        throw NotfoundException("Conversation not found")
    }

    const isParticipant = conversation.participants.some(
        (p) => p.toString() === senderId.toString()
    )

    if (!isParticipant) {
        throw ForbiddenException("You are not a participant in this conversation")
    }

    const message = await ConversationMessageModel.create({
        conversationId,
        senderId,
        content
    })

    return message
}

export const getConversationMessages = async ({ conversationId }, userId, { page = 1, limit = 10 } = {}) => {
    const conversation = await ConversationModel.findById(conversationId)
    if (!conversation) {
        throw NotfoundException("Conversation not found")
    }

    const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId.toString()
    )

    if (!isParticipant) {
        throw ForbiddenException("You are not a participant in this conversation")
    }

    const skip = (page - 1) * limit

    const messages = await ConversationMessageModel.find({ conversationId })
        .populate("senderId", "firstname lastname username image")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: 1 })

    const count = await ConversationMessageModel.countDocuments({ conversationId })

    return {
        count,
        limit: Number(limit),
        pages: Math.ceil(count / limit),
        currentPage: Number(page),
        messages
    }
}

export const getMyConversations = async (userId) => {
    const conversations = await ConversationModel.find({
        participants: userId
    })
        .populate("participants", "firstname lastname username image")
        .populate("messageId", "content")
        .sort({ createdAt: -1 })

    return conversations
}