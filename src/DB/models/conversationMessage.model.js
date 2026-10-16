import mongoose from 'mongoose'

const ConversationMessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: function () {
            return this.attachments?.length > 0 ? false : true
        },
        minLength: 1,
        maxLength: 50000
    },
    attachments: [String]
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true,
    autoindex: true
})

export const ConversationMessageModel = mongoose.models.ConversationMessage || mongoose.model('ConversationMessage', ConversationMessageSchema)