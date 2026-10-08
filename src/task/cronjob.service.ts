
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
const axios = require('axios');
import * as https from 'https';

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);

  constructor(private schedulerRegistry: SchedulerRegistry) {}

  onModuleInit() {
    this.addETLJob()
  }

  addETLJob() {

    const cronTime = process.env.PARAMETROSCRON;

    if (!cronTime) {
      this.logger.error('Cron time not defined in environment variables');
      return;
    }

    const job = new CronJob(cronTime, () => {
      this.handleCron();
    });

    this.schedulerRegistry.addCronJob('ETL Job', job);
    job.start();

    this.logger.debug(`Cron job added with time: ${cronTime}`);
  }

  handleCron() {

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Ignora la validez del certificado
    });
    
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'http://localhost:3014/Api/GetReportes',
        httpsAgent,
        headers: { }
      };

      axios.request(config)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  upSFTP() {

    const cronTime = process.env.PARAMETROSCRON;

    if (!cronTime) {
      this.logger.error('Cron time not defined in environment variables');
      return;
    }


    this.logger.debug(`Cron job added with time: ${cronTime}`);
  }



}
