import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from "@nestjs/mongoose";
import config from "config"
import { AllExceptionFilter } from "./common/exception.filter";
import { UsersModule } from './users/users.module';
import { MailerModule } from "@nestjs-modules/mailer";
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
@Module({
  imports: [
    MongooseModule.forRoot(config.get('mongodburl')),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: config.get('smpt_user'),
          pass: config.get('smpt_password')
        },
        tls: {
          rejectUnauthorized: false
        }
      },
      template: {
        dir: join(__dirname, 'shared', 'utility', 'mailer', 'templates'),
        adapter: new HandlebarsAdapter()
      }
    }),
    ProductsModule,
    OrdersModule,
    UsersModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter
    }
  ],
})
export class AppModule {


}
