import { MessageModel } from "../../DB/models/message.model.js";
import * as base from "./base.repository.js"

const findById = async ({ id, options }) => {
    return await base.findById({ model: MessageModel, id, options })
}

const findOne = async ({ filter, options } = {}) => {
    return await base.findOne({ filter, options, model: MessageModel })
}

const find = async ({ filter, options } = {}) => {
    return await base.find({ model: MessageModel, filter, options })
}

const countDocuments = async ({ filter } = {}) => {
    return await base.countDocuments({ model: MessageModel, filter })
}

const paginate = async ({ filter = {}, options = {}, page = 1, limit = 5 } = {}) => {
    return await base.paginate({ model: MessageModel, filter, options, page, limit })
}

const create = async ({ data, options }) => {
    return await base.create({ model: MessageModel, data, options })
}

const insertMany = async ({ data }) => {
    return await base.insertMany({ model: MessageModel, data })
}

const updateOne = async ({ filter, update, options } = {}) => {
    return await base.updateOne({ model: MessageModel, update, filter, options })
}

const findOneAndUpdate = async ({ filter, update, options } = {}) => {
    return await base.findOneAndUpdate({ model: MessageModel, filter, update, options })
}

const findByIdAndUpdate = async ({ id, update, options = { new: true } }) => {
    return await base.findByIdAndUpdate({ model: MessageModel, id, update, options })
}

const deleteOne = async ({ filter }) => {
    return await base.deleteOne({ model: MessageModel, filter })
}

const deleteMany = async ({ filter }) => {
    return await base.deleteMany({ model: MessageModel, filter })
}

const findOneAndDelete = async ({ filter } = {}) => {
    return await base.findOneAndDelete({ model: MessageModel, filter })
}

const createOne = async ({ data, options }) => {
    return await base.createOne({ model: MessageModel, data, options })
}

export const messageRepository = {
    findById,
    findOne,
    find,
    countDocuments,
    paginate,
    create,
    insertMany,
    updateOne,
    findOneAndUpdate,
    findByIdAndUpdate,
    deleteOne,
    deleteMany,
    findOneAndDelete,
    createOne
}