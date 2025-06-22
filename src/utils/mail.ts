import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 3000,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.GOOGLE_PASSWORD
  },
});

export const sendMail = (email: string, name: string) => {
    const mailOptions = {
  from: process.env.email,
  to: email,
  subject: "Sign up successfull",
  text: `Congratulations ${name},  
  YOU HAVE SUCCESSFULLY SIGNED IN`,
};
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email: ", error);
  } else {
    console.log("Email sent: ", info.response);
  }
});
}