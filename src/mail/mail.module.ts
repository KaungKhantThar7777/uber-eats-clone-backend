import { DynamicModule, Global, Module } from '@nestjs/common';
import { MAIL_OPTIONS } from './mail.constants';
import { MailOptions } from './mail.interface';
import { MailService } from './mail.service';

@Module({})
@Global()
export class MailModule {
  static forRoot(mailOptions: MailOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: MAIL_OPTIONS,
          useValue: mailOptions,
        },
        MailService,
      ],
      exports: [MailService],
    };
  }
}
