import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseUser } from '@tfarras/nestjs-firebase-auth';
import { User } from '@prisma/client';
import { PageDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(firebaseUser: FirebaseUser) {
    const user = await this.prisma.user.create({
      data: {
        email: firebaseUser.email,
        name: firebaseUser.name,
        facebook_id: firebaseUser.firebase.identities['facebook.com'][0],
        firebase_uid: firebaseUser.uid,
        profile_pic: firebaseUser.picture,
      },
    });
    return user;
  }

  async addPage(user: User, dto: PageDto) {
    // TODO: get data
    const page = await this.prisma.page.create({
      data: {
        userId: user.id,
        page_access_token: dto.long_lived_token,
        page_id: '',
        page_name: '',
      },
    });
    return page;
  }
}
