import { EventEmitter } from "node:events"
import { sendEmail } from "../utils/email/send.email.js"
import { emailTemplate } from "../utils/email/template/confirmEmail.template.js"
export const emailEvent = new EventEmitter()
emailEvent.on("sendEmail", async ({ recipient, subject, data }) => {
    try {
        await sendEmail({
            ...recipient,
            subject,
            html: emailTemplate({ subject, data })
        })
    } catch (error) {
        console.log("Failed to send email:", error.message)
    }
})