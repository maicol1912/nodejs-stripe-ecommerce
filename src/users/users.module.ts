import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from "../shared/repositories/user.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../shared/schema/user";
import { MailerHandlerService } from "../shared/utility/mailer/mail-handler";
import { RolesGuard } from "../shared/middleware/roles.guard";
import { APP_GUARD } from "@nestjs/core";
import { AuthMiddleware } from "../shared/middleware/auth";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, MailerHandlerService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(AuthMiddleware)
      .forRoutes({ path: 'users', method: RequestMethod.GET })
  }
}
