import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { downloadEmailTemplate } from './email-templates';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // Configuração do Nodemailer lendo diretamente do .env (configuração limpa)
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<string>('EMAIL_SECURE') === 'true', // true para 465, false para 587
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
      // NOTA: O BLOCO TLS CUSTOMIZADO FOI REMOVIDO PARA EVITAR CONFLITO DE PROTOCOLO (wrong version number)
    });
  }

  // Função principal para envio da entrega
  async sendDownloadLink(recipientEmail: string, downloadLink: string, orderId: string, productTitle: string, licenseKey: string): Promise<void> {

    const mailOptions = {
      from: `"${this.configService.get<string>('EMAIL_FROM_NAME')}" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: recipientEmail,
      subject: `✅ Seu produto Havenn Market está pronto: ${productTitle}`,
      html: downloadEmailTemplate(orderId, productTitle, downloadLink, licenseKey),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`E-mail enviado para ${recipientEmail}: ${info.messageId}`);
    } catch (error) {
      // Este erro será o último a ser verificado no terminal
      this.logger.error(`Falha ao enviar e-mail para ${recipientEmail}:`, error.stack);
    }
  }
}