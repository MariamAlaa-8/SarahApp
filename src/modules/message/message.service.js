import { NotfoundException } from "../../common/exceptions/index.js"
import { userRepository } from "../../common/repository/user.repository.js"
import { messageRepository } from "../../common/repository/message.repository.js"

export const createMessage = async ({ content, receiverId } = {}, files = [], user = undefined) => {
    const checkReceiverExist = await userRepository.findById({
        id: receiverId
    })

    if (!checkReceiverExist) {
        throw NotfoundException("Invalid receiver Id")
    }

    const message = await messageRepository.createOne({
        data: {
            receiverId,
            content,
            attachments: files.map(ele => ele.filepath),
            ...(user ? { senderId: user._id } : {})
        }
    })

    return message
}

export const getallMessages = async ({ type, limit, page } = {}, user) => {
    let filter = {}

    if (type == "0") {
        filter = { receiverId: user._id }
    } else if (type == "1") {
        filter = { senderId: user._id }
    } else {
        filter = {
            $or: [
                { senderId: user._id },
                { receiverId: user._id }
            ]
        }
    }

    const data = await messageRepository.paginate({
        page,
        limit,
        filter,
        options: { sort: { createdAt: -1 } }
    })

    return data
}

export const deleteMessage = async ({ messageId }, user) => {
    const data = await messageRepository.deleteOne({
        filter: { receiverId: user._id, _id: messageId }
    })

    if (!data.deletedCount) {
        throw NotfoundException("Invalid message id")
    }

    return data
}

export const getMessage = async ({ messageId }, user) => {
    const data = await messageRepository.findOne({
        filter: { receiverId: user._id, _id: messageId }
    })

    if (!data) {
        throw NotfoundException("Invalid message id")
    }

    return data
}