import { Message } from '@google-cloud/pubsub';
import { Controller, Post, Body, Patch, Param, Req, UsePipes, UseGuards } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { pubSubConfig } from '../../../config';
import { OriginSalesEnum } from '../../../contracts/enums/sales.enum';
import { appRoutes } from '../../app.routes';
import { RestrictedGuard } from '../../common';
import { ApiResponses } from '../../common/decorators';
import { MessagePubSubValidationPipe } from '../../common/pipes/validation';
import { CreateSaleInputSchema, PaySaleInputSchema } from '../schemas/inputs';
import { SaleOutputSchema } from '../schemas/outputs';
import {
  CancelSalesService,
  CreateSalesService,
  PaySalesService,
  PubSubSalesService,
} from '../services';

@ApiTags(appRoutes.sales.main)
@Controller(appRoutes.sales.main)
export class SalesController {
  constructor(
    private readonly createSalesService: CreateSalesService,
    private readonly cancelSalesService: CancelSalesService,
    private readonly paySalesService: PaySalesService,
    // private readonly pubsub: PubSub,
    private readonly pubsubSalesService: PubSubSalesService,
  ) {}

  @UseGuards(RestrictedGuard)
  @Post(appRoutes.sales.createSale)
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponses({ sucessStatusCode: 201, succesType: Boolean, isProtected: true })
  public async createSale(
    @Body() createSalesDto: CreateSaleInputSchema,
    @Req() req: FastifyRequest,
  ): Promise<boolean> {
    createSalesDto.origin = OriginSalesEnum.HTTP;
    createSalesDto.clientId = (req as any).clientId;
    return this.createSalesService.enqueue(createSalesDto);
  }

  @EventPattern(pubSubConfig.subscriptions.createSale)
  @UsePipes(new MessagePubSubValidationPipe())
  public async createSaleFromPubSub(@Body() message: Message): Promise<boolean> {
    return this.pubsubSalesService.processMessage(message);
  }

  @UseGuards(RestrictedGuard)
  @Post(appRoutes.sales.paySale)
  @ApiOperation({ summary: 'Pay a sale' })
  @ApiResponses({ sucessStatusCode: 201, succesType: Boolean, isProtected: true })
  public async paySale(
    @Body() paySalesDto: PaySaleInputSchema,
    @Req() req: FastifyRequest,
  ): Promise<boolean> {
    paySalesDto.clientId = (req as any).clientId;
    return this.paySalesService.enqueue(paySalesDto);
  }

  @Patch(`${appRoutes.sales.cancelSale}/:id`)
  @ApiOperation({ summary: 'Cancel a sale' })
  @ApiResponses({ sucessStatusCode: 200, succesType: SaleOutputSchema, isProtected: true })
  public async cancelSale(@Param('id') id: number): Promise<SaleOutputSchema> {
    return this.cancelSalesService.cancel(id);
  }
}
