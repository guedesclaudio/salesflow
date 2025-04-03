import { Controller, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateSaleInputSchema, PaySaleInputSchema } from '../schemas/inputs';
import { SaleOutputSchema } from '../schemas/outputs';
import { ApiResponses } from '../../common/decorators';
import { RestrictedGuard } from '../../common';
import { appRoutes } from '../../app.routes';
import { CancelSalesService, CreateSalesService, PaySalesService } from '../services';
import { OriginSalesEnum } from '../../../contracts/enums/sales.enum';
import { FastifyRequest } from 'fastify';
import { Message } from '@google-cloud/pubsub';
import { EventPattern } from '@nestjs/microservices';
import { pubSubConfig } from '../../../config';

@ApiTags(appRoutes.sales.main)
@Controller(appRoutes.sales.main)
@UseGuards(RestrictedGuard)
export class SalesController {
  constructor(
    private readonly createSalesService: CreateSalesService,
    private readonly cancelSalesService: CancelSalesService,
    private readonly paySalesService: PaySalesService,
  ) {}

  @Post(appRoutes.sales.createSale)
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponses({ sucessStatusCode: 201, succesType: Boolean, isProtected: true })
  public async createSale(
    @Body() createSalesDto: CreateSaleInputSchema,
    @Req() req: FastifyRequest,
  ): Promise<Boolean> {
    createSalesDto.origin = OriginSalesEnum.HTTP;
    createSalesDto.clientId = (req as any).clientId;
    return this.createSalesService.enqueue(createSalesDto);
  }
  
  @EventPattern(pubSubConfig.subscriptions.createSale)
  public async createSaleFromPubSub(
    @Body() message: Message,
  ): Promise<Boolean> {
    const data: CreateSaleInputSchema = JSON.parse(message.data.toString());
    data.origin = OriginSalesEnum.PUBSUB;
    
    try {
      await this.createSalesService.enqueue(data);
      message.ack(); //TODO - LOGAR
      return true;
    } catch (error) {
      message.nack(); //TODO - LOGAR
      return false;
    }
  }

  @Post(appRoutes.sales.paySale)
  @ApiOperation({ summary: 'Pay a sale' })
  @ApiResponses({ sucessStatusCode: 201, succesType: Boolean, isProtected: true })
  public async paySale(
    @Body() paySalesDto: PaySaleInputSchema,
    @Req() req: FastifyRequest,
  ): Promise<Boolean> {
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

// TODO - RECEBER VENDA JOGAR NA FILA DO BULL MQ OK
// TODO - SALVAR A VENDA COM STATUS PENDING OK
// TODO - VAI PROCESSAR, FAZER A AUTORIZAÇÃO COM MÉTODOS DE PAGAMENTO E CHAMAR O WEBHOOK PRA DEVOLVER A INTENÇÃO DO STRAPI OK
// TODO - SE DER ERRO VAI TENTAR 3X E AO FINAL SE CONTINUAR O ERRO VAI COLOCAR O STATUS COM ERROR E O MOTIVO OK

// TODO - CRIAR ENDPOINT PRA FINALIZAR VENDA COMO PROCESSED (ASYNC TAMBEM, MAS NESSE CASO NAO PRECISAMOS DE WEBHOOK, CRIAR UMA FILA SEPARADA SÓ PRA ISSO) OK

// TODO - ADICIONAR ORIGIN PUBSUB (CRIACAO DA VENDA SOMENTE, A FINALIZACAO VAI SER VIA WEBHOOK)

// TODO - CRIAR ENDPOINT PRA GERAR NUMERO DE AUTORIZACAO ? // SIM

// TODO - ADICIONAR CONFIG DOS LOGS PARA O ELASTIC

// TODO - CRIAR CLASSE PRA CENTRALIZAR LOGS E MENSAGENS

// TODO - CONFIGURAR BULL BOARD

// TODO - CRIAR TESTES DE INTEGRAÇÃO, UNITARIOS OU E2E (ANALISAR QUAL O MELHOR)
// TODO - CRIAR SCRIPT PARA TESTE DE CARGA

// TODO - RODAR MIGRATIONS (MIGRATION UNICA)
