import { Controller, Get,Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}



  @Get('getReportes')
  GetPrestamos() {
    return this.appService.getReportes();
  }



}
