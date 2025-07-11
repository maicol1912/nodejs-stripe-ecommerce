import { Controller, Get, Post, Body, Headers, Param, Delete, Query, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { checkoutDtoArr } from "./dto/checkout.dto";

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get()
  findAll(@Query('status') status: string, @Req() req: any) {
    return this.ordersService.findAll(status, req.user);
  }

  @Get('ngrok')
  ngrok() {
    return this.ordersService.startWebhookListener()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  @Post('/checkout')
  async checkout(@Body() body: checkoutDtoArr, @Req() req: any) {
    return await this.ordersService.checkout(body, req.user)
  }

  @Post('/webhook')
  async webhook(@Body() rawBody: Buffer, @Headers('stripe-signature') sig: string) {
    console.log("Webhook stripe")
    console.log(sig)
    return await this.ordersService.webhook(rawBody, sig)
  }

  @Get('/checkout/order-success')
  async orderSuccess() {
    return {
      success: true,
      message: "Order payed Successfully. Thank you for your purchase",
      result: null
    }
  }

  @Get('/checkout/order-cancel')
  async orderCancel() {
    console.log("Entre aca")
    return {
      success: true,
      message: "Order canceled Successfully. Try again when you want",
      result: null
    }
  }
}
