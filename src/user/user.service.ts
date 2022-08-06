import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseUser } from '@tfarras/nestjs-firebase-auth';
import { User } from '@prisma/client';
import { PageDto } from './dto';
import { GraphService } from 'src/graph/graph.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private graphService: GraphService,
  ) {}

  async createUser(firebaseUser: FirebaseUser) {
    const user = await this.prisma.user.findUnique({
      where: {
        firebase_uid: firebaseUser.uid,
      },
    });

    if (user) {
      return user;
    }

    const new_user = await this.prisma.user.create({
      data: {
        email: firebaseUser.email,
        name: firebaseUser.name,
        facebook_id: firebaseUser.firebase.identities['facebook.com'][0],
        firebase_uid: firebaseUser.uid,
        profile_pic: firebaseUser.picture,
      },
    });
    return new_user;
  }

  async addPage(user: User, dto: PageDto) {
    try {
      const data = await this.graphService.getUserId(dto.access_token);

      const page = await this.prisma.page.create({
        data: {
          userId: user.id,
          page_access_token: dto?.long_lived_token ?? dto?.access_token,
          page_id: data.id,
          page_name: data.name,
        },
      });

      await this.graphService.setPageSubscription(data.id, dto.access_token);

      return page;
    } catch (e) {
      throw new HttpException(
        e?.response?.data ?? e,
        e?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMe(user: User) {
    const me = await this.prisma.user.findFirst({
      where: {
        id: user.id,
      },
      include: {
        pages: true,
      },
    });
    return me;
  }

  async setSubscription(page_id: string, access_token: string) {
    try {
      await this.graphService.setPageSubscription(page_id, access_token);
    } catch (e) {
      throw new HttpException(
        e?.response?.data ?? e,
        e?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
