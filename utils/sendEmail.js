const nodemailer = require("nodemailer");

const sendEmail = async (subject, message, sent_to, sent_from, reply_to) => {
  var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "370e9ca51b67a3",
      pass: "24034a4ff93f60",
    },
  });

  let options = await transporter.sendMail({
    from: sent_from,
    to: sent_to,
    subject: subject,
    html: message,
  });

  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;
