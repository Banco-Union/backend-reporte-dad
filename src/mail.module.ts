import { Module } from '@nestjs/common';
import { MailService } from './mail.services';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}