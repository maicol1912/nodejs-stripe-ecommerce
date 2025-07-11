import { MailerService } from '@nestjs-modules/mailer'
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class MailerHandlerService {
    constructor(@Inject(MailerService) private readonly mailService: MailerService) { }
    public async sendEmail(to: string[], subject: string, templateName: string, info: Record<string, any>) {
        const result = await this.mailService.sendMail({
            from: 'maicolarcila502@gmail.com',
            to: to,
            subject: subject,
            template: templateName,
            context: {
                ...info
            }
        });
        return result
    }
}


