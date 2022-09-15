import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseUser } from '@tfarras/nestjs-firebase-auth';
import { User } from '@prisma/client';
import { PageDto } from './dto';
import { GraphService } from 'src/graph/graph.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
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
      this.logger.debug('DTO>>>>');
      this.logger.debug(dto);
      const data = await this.graphService.getUserId(dto.access_token);

      this.logger.debug('DATA>>>', data);

      const insta_page = await this.graphService.getPageData(
        data.id,
        dto.access_token,
      );

      this.logger.debug('INSTA_PAGE>>>', insta_page);

      const insta_id = await this.graphService.getInstaId(
        insta_page?.id,
        insta_page?.access_token,
      );

      this.logger.debug('ID>>>', insta_id);

      const insta_data = await this.graphService.getUserProfile(
        insta_id?.id,
        insta_page?.access_token,
      );

      this.logger.debug('INSTA_DATA>>>', insta_data);

      const page_pic = await this.graphService.getPagePic(data.id);
      this.logger.debug('PAGE_PIC>>', page_pic);

      // TODO: Save images to S3

      // Check if page already exists
      const page_found = await this.prisma.page.findFirst({
        where: {
          insta_id: insta_id.id,
          userId: user.id,
        },
      });

      this.logger.debug('PAGE_FOUND>>>', page_found);

      if (page_found) {
        return page_found;
      }

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
        insta_page.id,
        insta_page.access_token,
      );

      return page;
    } catch (e) {
      this.logger.debug(
        'There was an error adding the page>>',
        e?.response?.data ?? e,
      );
      if (e?.code == 'P2002') {
        throw new BadRequestException(
          'Failed to add page - This page already exists',
          e,
        );
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
