import { Inject, Injectable } from '@nestjs/common';
import got from 'got';
import * as FormData from 'form-data';
import { MAIL_OPTIONS } from './mail.constants';
import { EmailVariables, MailOptions } from './mail.interface';

@Injectable()
export class MailService {
  constructor(@Inject(MAIL_OPTIONS) private readonly options: MailOptions) {
    // this.sendMail('Verification account', 'kaungkhantthar77@gmail.com');
  }

  private async sendMail(
    subject: string,
    to: string,
    emailVars: EmailVariables[],
  ) {
    const form = new FormData();
    form.append('subject', subject);
    form.append('template', 'verify-email');
    form.append('to', to);
    form.append('from', 'no-reply@reply.com');
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));

    try {
      const res = await got(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );

      console.log(res.body);
    } catch (error) {
      console.log(error);
    }
  }

  async sendVerification(to: string, emailVars: EmailVariables[]) {
    await this.sendMail('Verification Email Account', to, emailVars);
  }
}
