import ejs from "ejs";
import nodemailer, { Transporter } from "nodemailer";
import path from "path";
import { EmailOptions } from "../interfaces/Mail";

class EmailService {
    private transporter:Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    public async sendMail(options:EmailOptions): Promise<void> {
        try {
            const {email,subject,template,data} = options;

            const templatePath = path.join(__dirname,"../mails",template);

            const html:string = await ejs.renderFile(templatePath,data);

            const mailOptions = {
                from: process.env.SMTP_MAIL,
                to: email,
                subject,
                html,
            };
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            // Handle email sending errors here
            console.error("Error sending email:", error);
            throw error;
        }
    }
}

export default EmailService;