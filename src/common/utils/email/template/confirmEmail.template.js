import { EmailSubjectEnum } from "../../../enum/index.js"

const baseTemplate = ({ title, code, description }) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                h1 { color: #333; text-align: center; }
                p { color: #555; line-height: 1.6; }
                .otp { display: block; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007bff; background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${title}</h1>
                <p>${description}</p>
                <span class="otp">${code}</span>
                <p>This code is valid for <strong>2 minutes</strong>.</p>
                <div class="footer">
                    <p>© 2025 SarahApp. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
}

const htmlTemplates = {
    [EmailSubjectEnum.CONFIRM_EMAIL]: ({ code }) => baseTemplate({
        title: "Confirm Your Email",
        code,
        description: "Please use the OTP code below to confirm your email address:"
    }),

    [EmailSubjectEnum.ENABLE_2FA]: ({ code }) => baseTemplate({
        title: "Enable 2-Step Verification",
        code,
        description: "Use this OTP code to enable 2-Step Verification on your account:"
    }),

    [EmailSubjectEnum.LOGIN_2FA]: ({ code }) => baseTemplate({
        title: "Login Verification Code",
        code,
        description: "Use this OTP code to complete your login:"
    }),

    [EmailSubjectEnum.FORGOT_PASSWORD]: ({ code }) => baseTemplate({
        title: "Reset Your Password",
        code,
        description: "Use this OTP code to reset your password:"
    })
}

export const emailTemplate = ({ subject, data = {} }) => {
    const template = htmlTemplates[subject]
    if (!template) {
        return ""
    }
    return template(data)
}