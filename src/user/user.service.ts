import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
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
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          facebook_id: data.id,
        },
      });

      const insta_page = await this.graphService.getPageData(
        data.id,
        dto.access_token,
      );

      const insta_id = await this.graphService.getInstaId(
        insta_page.id,
        insta_page?.access_token,
      );

      const insta_data = await this.graphService.getUserProfile(
        insta_id.id,
        insta_page.access_token,
      );

      const page_pic = await this.graphService.getPagePic(data.id);

      // TODO: Save images to S3

      const page = await this.prisma.page.create({
        data: {
          userId: user.id,
          page_access_token: insta_page?.access_token,
          page_id: insta_page.id,
          page_name: insta_page.name,
          insta_id: insta_id.id,
          insta_profile_pic: insta_data.profilePic,
          facebook_profile_pic: page_pic,
          insta_username: insta_data.username,
        },
      });

      await this.graphService.setPageSubscription(
        data.id,
        insta_page.access_token,
      );

      return page;
    } catch (e) {
      if (e.code == 'P2002') {
        throw new BadRequestException('You have added this page');
      } else {
        throw new HttpException(
          e?.response?.data ?? e,
          e?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
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
