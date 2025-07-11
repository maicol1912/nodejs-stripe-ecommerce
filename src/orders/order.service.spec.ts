import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { Order, OrderSchema, paymentStatus } from '../shared/schema/order';
import { OrdersRepository } from '../shared/repositories/order.repository';
import { UserRepository } from '../shared/repositories/user.repository';
import { ProductRepository } from '../shared/repositories/product.repository';
import { MailerHandlerService } from '../shared/utility/mailer/mail-handler';
import Stripe from 'stripe';
import { stripeToken } from 'nestjs-stripe';
import { MongooseModule } from '@nestjs/mongoose';
import { License, LicenseSchema } from '../shared/schema/license';
import { User, UserSchema } from '../shared/schema/user';
import { Product, ProductSchema } from '../shared/schema/product';
import config from 'config';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

describe('OrderController', () => {
    let orderService: OrdersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(config.get('mongodburl')),
                MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
                MongooseModule.forFeature([{ name: License.name, schema: LicenseSchema }]),
                MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
                MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
                MailerModule.forRoot({
                    transport: {
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        auth: {
                            user: 'maicolarcila502@gmail.com',
                            pass: 'ztlv gmar wjkw mpgw'
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
            ],
            providers: [
                OrdersService,
                OrdersRepository,
                UserRepository,
                ProductRepository,
                MailerHandlerService,
                { provide: stripeToken, useValue: 'mock-stripe-token' }
            ],
        }).compile();

        orderService = module.get<OrdersService>(OrdersService);
    });

    describe('findAll', () => {
        it('should return an array of orders', async () => {
            const user = {
                _id: '658df4a30b650d47444af257',
                name: 'Maicol arcila',
                email: 'maicolarcila34@gmail.com',
                password: '$2b$10$Ik8P2hii.Unw8lQqetIK0uc3XoJIc2td3TJX/RCDpxeRq3S2pAecS',
                type: 'admin',
                isVerified: true,
            }

            const serviceResult = await orderService.findAll(paymentStatus.paid, user);


            expect(serviceResult.success).toBe(true);
            expect(serviceResult.result.length).toEqual(0);
            expect(serviceResult.message).toBe('Orders fetched successfully');
        });
    });
});
