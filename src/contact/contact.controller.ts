import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  contactUs(@Body() dto: ContactDto) {
    return this.contactService.contactUs(dto);
  }
}
