import nodemailer from "nodemailer"
const trasnporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASSWORD
    }
})

export const sendEmali = async (toMail, subject, body) => {
    try {
        await trasnporter.sendMail({
            from: process.env.ADMIN_EMAIL,
            to: toMail,
            subject: subject,
            html: body
        })

    } catch (error) {

        throw error
    }
}