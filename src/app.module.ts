import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task/cronjob.service';
import { AppService } from './app.service';
import { MailModule } from './mail.module';

@Module({
  imports: [
      ScheduleModule.forRoot(),
      ConfigModule.forRoot(),
      TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DBIP,
      port: 1433,
      username: process.env.DBUSER,
      password: process.env.DBPASS,
      database: process.env.DB,
      entities:  [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities:true,
      extra: {
        trustServerCertificate: true,
        requestTimeout:700000
      }    
    }),
    MailModule

  ],
  controllers: [AppController],
  providers: [AppService,TasksService],
})
export class AppModule {}
  