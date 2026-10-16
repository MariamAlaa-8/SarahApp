import mongoose from 'mongoose'

const ConversationSchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Types.ObjectId,
        ref: "Message",
        required: true
    },
    participants: [{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }]
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true,
    autoindex: true
})

export const ConversationModel = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema)