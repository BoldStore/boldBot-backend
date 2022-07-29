import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { auth } from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: string) {
    const decodedIdToken: DecodedIdToken = await auth().verifyIdToken(payload);

    const user = this.prisma.user.findFirstOrThrow({
      where: {
        firebase_uid: decodedIdToken.uid,
      },
    });

    return user;
  }
}
