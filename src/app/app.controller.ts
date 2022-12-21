import { Controller, Get, Logger } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly logger: Logger) {}
  @Get()
  index() {
    this.logger.debug('Hello BOLDbot!', AppController.name);
    return 'BOLDbot is up and running';
  }
}
