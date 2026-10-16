import mongoose from 'mongoose'

const IdentityRequestSchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Types.ObjectId,
        ref: "Message",
        required: true
    },
    requesterId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true,
    autoindex: true
})

export const IdentityRequestModel = mongoose.models.IdentityRequest || mongoose.model('IdentityRequest', IdentityRequestSchema)