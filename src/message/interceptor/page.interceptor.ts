import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PageInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    try {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (request.method === 'POST') {
        const pageId = request.body.pageId;
        //   Check if user has the page
        if (pageId) {
          await this.prisma.page.findFirstOrThrow({
            where: {
              id: pageId,
              userId: user.id,
            },
          });
        }
      }
      return next.handle();
    } catch (e) {
      return throwError(() => new NotFoundException('No Page found'));
    }
  }
}
