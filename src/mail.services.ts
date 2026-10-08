// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.CORREOHOST, 
      port: 587,
      secure: false, 
      auth: {
        user: process.env.CORREO, 
        pass: process.env.PASS, 
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html: string) {
    const mailOptions = {
      from: process.env.CORREO, 
      to,
      subject,
      text,
      html,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
