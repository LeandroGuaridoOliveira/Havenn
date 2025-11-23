import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
            html: this.createDownloadEmailTemplate(orderId, productTitle, downloadLink, licenseKey),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`E-mail enviado para ${recipientEmail}: ${info.messageId}`);
        } catch (error) {
            // Este erro será o último a ser verificado no terminal
            this.logger.error(`Falha ao enviar e-mail para ${recipientEmail}:`, error.stack);
        }
    }

    // Template simples de e-mail em HTML
    private createDownloadEmailTemplate(orderId: string, productTitle: string, downloadLink: string, licenseKey: string): string {
        return `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #09090b; color: #f4f4f5; border: 1px solid #1f2937;">
        <h2 style="color: #6366f1;">Obrigado por sua compra no Havenn Market!</h2>
        <p>Seu pedido **#${orderId.substring(0, 8)}** foi concluído com sucesso.</p>
        
        <h3 style="color: #e4e4e7;">Sua Chave de Licença:</h3>
        <p style="font-weight: bold; color: #4f46e5; background-color: #1f2937; padding: 10px; border-radius: 5px; text-align: center;">
          ${licenseKey}
        </p>
        <p style="margin-top: 15px;">Use esta chave para ativar seu software.</p>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${downloadLink}" 
             style="display: inline-block; padding: 12px 25px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            BAIXAR AGORA
          </a>
        </div>
        
        <p style="margin-top: 25px; font-size: 0.85em; color: #9ca3af;">
          O link de download é válido por 24 horas.
        </p>
      </div>
    `;
    }
}