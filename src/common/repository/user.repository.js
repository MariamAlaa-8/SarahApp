import { UserModel } from "../../DB/models/user.model.js";
import * as base from "./base.repository.js"

const findById = async ({ id, options }) => {
    return await base.findById({ model: UserModel, id, options })
}

const findOne = async ({ filter, options } = {}) => {
    return await base.findOne({ filter, options, model: UserModel })
}

const find = async ({ filter, options } = {}) => {
    return await base.find({ model: UserModel, filter, options })
}

const countDocuments = async ({ filter } = {}) => {
    return await base.countDocuments({ model: UserModel, filter })
}

const paginate = async ({ filter = {}, options = {}, page = 1, limit = 5 } = {}) => {
    return await base.paginate({ model: UserModel, filter, options, page, limit })
}

const create = async ({ data, options }) => {
    return await base.create({ model: UserModel, data, options })
}

const insertMany = async ({ data }) => {
    return await base.insertMany({ model: UserModel, data })
}

const updateOne = async ({ filter, update, options } = {}) => {
    return await base.updateOne({ model: UserModel, update, filter, options })
}

const findOneAndUpdate = async ({ filter, update, options } = {}) => {
    return await base.findOneAndUpdate({ model: UserModel, filter, update, options })
}

const findByIdAndUpdate = async ({ id, update, options = { new: true } }) => {
    return await base.findByIdAndUpdate({ model: UserModel, id, update, options })
}

const deleteOne = async ({ filter }) => {
    return await base.deleteOne({ model: UserModel, filter })
}

const deleteMany = async ({ filter }) => {
    return await base.deleteMany({ model: UserModel, filter })
}

const findOneAndDelete = async ({ filter } = {}) => {
    return await base.findOneAndDelete({ model: UserModel, filter })
}

const createOne = async ({ data, options }) => {
    return await base.createOne({ model: UserModel, data, options })
}

export const userRepository = {
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