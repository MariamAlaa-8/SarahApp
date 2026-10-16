import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: function () {
            return this.attachments?.length > 0 ? false : true
        },
        minLength: 2,
        maxLength: 50000
    },
    attachments: [String],
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    receiverId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },isAnonymous: {
    type: Boolean,
    default: false
}
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true,
    autoindex: true
});

export const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);