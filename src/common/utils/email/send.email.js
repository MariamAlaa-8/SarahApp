
import nodemailer from "nodemailer"
import { APP_EMAIL, APP_PASSWORD } from "../../../config.js"
import { BadException } from "../../exceptions/index.js"
export const UserEmailKey = ({ email, subject }) => {
    return `User::${email}::${subject}_OTP`
}
export const UserOTPTarilsEmailKey = ({ email, subject }) => {
    return `User::${email}::${subject}_OTP_Trails`
}
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
})
export async function sendEmail({
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments = [],
}) {
    try {
        if (!to?.length && !cc?.length && !bcc?.length) {
            throw BadException("Invalid recipient")
        }
        if (!html?.length && !text?.length && !attachments?.length) {
            throw BadException("Invalid email payload")
        }
        const info = await transporter.sendMail({
            from: `app <${APP_EMAIL}>`,
            to,
            cc,
            bcc,
            subject,
            text,
            html,
            attachments
        })
        console.log("Message sent: %s", info.messageId)
        return info
    } catch (err) {
        console.log("Error while sending mail:", err)
        throw err
    }
}