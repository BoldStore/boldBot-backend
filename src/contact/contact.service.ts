import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactDto } from './dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async contactUs(dto: ContactDto) {
    try {
      const lead = await this.prisma.lead.create({
        data: {
          name: dto.name,
          insta_username: dto.insta_username,
        },
      });
      return lead;
    } catch (e) {
      if (e.code == 'P2002') {
        throw new BadRequestException('You have already contacted us');
      } else {
        throw new HttpException(e, 500);
      }
    }
  }
}
