const nodemailer = require('nodemailer');

function sendEmail(email, subject, body, callback)
{
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        secure: true,
        port: 465,
        auth: {
            user: 'tanmayramtirth@gmail.com',
            pass: '',
        },
    })

    const mailOptions = {
        from: 'Tanmay',
        to: email,
        subject: subject,
        html: body,
    }

    transporter.sendMail(mailOptions, function(error, info) {
        callback(error, info)
    })
}

module.exports = {
    sendEmail: sendEmail,
}