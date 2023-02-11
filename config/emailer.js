var NODEMAILER = require('nodemailer');

module.exports = {

    getTransporter: () => {
        const transporter = NODEMAILER.createTransport({
            port: 465,               // true for 465, false for other ports
            host: "smtp.gmail.com",
            auth: {
                user: 'skhacker105@gmail.com',
                pass: 'smvkvdesquabqezs',
            },
            secure: true,
        });
        return transporter;
    }
}