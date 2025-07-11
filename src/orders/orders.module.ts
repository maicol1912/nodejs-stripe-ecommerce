import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "../shared/schema/order";
import { UserRepository } from "../shared/repositories/user.repository";
import { ProductRepository } from "../shared/repositories/product.repository";
import { OrdersRepository } from "../shared/repositories/order.repository";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "../shared/middleware/roles.guard";
import { StripeModule } from "nestjs-stripe";
import config from "config";
import { License, LicenseSchema } from "../shared/schema/license";
import { User, UserSchema } from "../shared/schema/user";
import { Product, ProductSchema } from "../shared/schema/product";
import { AuthMiddleware } from "../shared/middleware/auth";
import { MailerHandlerService } from "../shared/utility/mailer/mail-handler";

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    UserRepository,
    ProductRepository,
    OrdersRepository,
    MailerHandlerService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },

  ],
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: License.name, schema: LicenseSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    StripeModule.forRoot({
      apiKey: config.get('stripe.secret_key'),
      apiVersion: '2023-10-16'
    })
  ]
})
export class OrdersModule implements NestModule {
  constructor(
    private readonly ordersService: OrdersService
  ) {
    this.ordersService.startWebhookListener()
  }

  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(AuthMiddleware)
      .exclude(
        { path: 'orders/webhook', method: RequestMethod.POST },
        { path: 'orders/checkout/order-success', method: RequestMethod.GET },
        { path: 'orders/checkout/order-cancel', method: RequestMethod.GET },
      )
      .forRoutes(OrdersController);
  }
}
