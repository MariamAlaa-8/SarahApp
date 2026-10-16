import mongoose from 'mongoose';
import { GENDERENUM, ProvideEnum, ROLEENUM } from '../../common/enum/index.js';
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 26
    },
    lastname: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 26
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return this.provider==ProvideEnum.SYSTEM

            
        }
    },
    phone: {
        type: String,
    },
    DOB: {
        type: Date
    },
    confirmEmail: {
        type: Date
    },
    image: {
        type: String
    },
    coverImage: {
        type: [String]
    },
    gender: {
        type: Number,
        enum: Object.values(GENDERENUM),
        default: GENDERENUM.FEMALE
    },
    role: {
        type: Number,
        enum: Object.values(ROLEENUM),
        default: ROLEENUM.USER
    },
    enable2FA: {
    type: Boolean,
    default: false
}
    ,
    provider: {
        type: Number,
        enum: Object.values(ProvideEnum),
        default: ProvideEnum.SYSTEM
    },

    changeCredtialsTime:Date

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true,
    autoindex: true
});

userSchema.virtual('username').set(function (value) {
    const [firstname, lastname] = value?.split(' ') || [];
    this.set({ firstname, lastname });
}).get(function () {
    return `${this.firstname} ${this.lastname}`;
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);