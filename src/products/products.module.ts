import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { Product, ProductSchema } from "../shared/schema/product";
import { User, UserSchema } from "../shared/schema/user";
import { StripeModule } from "nestjs-stripe";
import config from "config";
import { AuthMiddleware } from "../shared/middleware/auth";
import { ProductRepository } from "../shared/repositories/product.repository";
import { UserRepository } from "../shared/repositories/user.repository";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "../shared/middleware/roles.guard";
import { License, LicenseSchema } from "../shared/schema/license";
import { Order, OrderSchema } from "../shared/schema/order";
import { OrdersRepository } from "../shared/repositories/order.repository";

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductRepository,
    UserRepository,
    OrdersRepository,
    { provide: APP_GUARD, useClass: RolesGuard }],
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: License.name, schema: LicenseSchema }]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    StripeModule.forRoot({
      apiKey: config.get('stripe.secret_key'),
      apiVersion: '2023-10-16'
    })
  ]
})
export class ProductsModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(AuthMiddleware)
      .exclude(
        {
          path: `products`,
          method: RequestMethod.GET
        },
        {
          path: `products/:id`,
          method: RequestMethod.GET
        }
      )
      .forRoutes(ProductsController)
  }
}
