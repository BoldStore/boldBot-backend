import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseUser } from '@tfarras/nestjs-firebase-auth';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(firebaseUser: FirebaseUser) {
    const user = await this.prisma.user.create({
      data: {
        email: firebaseUser.email,
        name: firebaseUser.name,
        facebook_id: firebaseUser.uid,
        firebase_uid: firebaseUser.uid,
      },
    });
    return user;
  }
}
