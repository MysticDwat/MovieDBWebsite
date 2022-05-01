//nodemailer and dotenv imports
const nodemailer = require('nodemailer');
require('dotenv').config();

//create transporter using gmail account
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SERV_EMAIL,
        pass: process.env.SERV_EMAIL_PW,
    },
});

//function to send email with confirmation link.
//email is recipient email address
//url is confirmation url link
async function sendConfirmationEmail(email, url){
    await transporter.sendMail({
        from: "CSE 4234 Movie App",
        to: email,
        subject: "Confirm your account.",
        text: `Please click the link to confirm your account. ${url}`
    }, (err) => {
        console.log(err);
        return false;
    });

    return true;
}

//export sendConfirmationEmail
module.exports = {sendConfirmationEmail};
