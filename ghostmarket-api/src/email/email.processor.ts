import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Processor('email')
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);

    constructor(private readonly emailService: EmailService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);

        switch (job.name) {
            case 'send-link':
                const { recipientEmail, downloadLink, orderId, productTitle, licenseKey } = job.data;
                try {
                    await this.emailService.sendDownloadLink(
                        recipientEmail,
                        downloadLink,
                        orderId,
                        productTitle,
                        licenseKey,
                    );
                    this.logger.log(`Email sent successfully for job ${job.id}`);
                } catch (error) {
                    this.logger.error(`Failed to send email for job ${job.id}: ${error.message}`);
                    throw error; // Rethrow to trigger retry
                }
                break;
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }
}
