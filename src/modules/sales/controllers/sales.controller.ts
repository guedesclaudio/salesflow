import { Controller, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateSaleInputSchema } from '../schemas/inputs';
import { SaleOutputSchema } from '../schemas/outputs';
import { ApiResponses } from '../../common/decorators';
import { RestrictedGuard } from '../../common';
import { appRoutes } from '../../app.routes';
import { CancelSalesService, CreateSalesService } from '../services';
import { OriginSalesEnum } from '../../../contracts/enums/sales.enum';

@ApiTags(appRoutes.sales.main)
@Controller(appRoutes.sales.main)
@UseGuards(RestrictedGuard)
export class SalesController {
  constructor(
    private readonly createSalesService: CreateSalesService,
    private readonly cancelSalesService: CancelSalesService,
  ) {}

  @Post(appRoutes.sales.createSale)
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponses({ sucessStatusCode: 201, succesType: SaleOutputSchema, isProtected: true })
  public async createSale(
    @Body() createSalesDto: CreateSaleInputSchema,
  ): Promise<SaleOutputSchema> {
    createSalesDto.origin = OriginSalesEnum.HTTP;
    return this.createSalesService.create(createSalesDto);
  }

  @Patch(`${appRoutes.sales.cancelSale}/:id`)
  @ApiOperation({ summary: 'Cancel a sale' })
  @ApiResponses({ sucessStatusCode: 200, succesType: SaleOutputSchema, isProtected: true })
  public async cancelSale(@Param('id') id: number): Promise<SaleOutputSchema> {
    return this.cancelSalesService.cancel(id);
  }
}

// TODO - RECEBER VENDA JOGAR NA FILA DO BULL MQ OK
// TODO - SALVAR A VENDA COM STATUS PENDING
// TODO - VAI PROCESSAR, FAZER A AUTORIZAÇÃO COM MÉTODOS DE PAGAMENTO E CHAMAR O WEBHOOK
// TODO - VAI TROCAR O STATUS PARA PROCESSADO
// TODO - SE DER ERRO VAI TENTAR 3X E AO FINAL SE CONTINUAR O ERRO VAI COLOCAR O STATUS COM ERROR E O MOTIVO

// TODO - RODAR MIGRATIONS

//TODO - ADICIONAR CONFIG DOS LOGS PARA O ELASTIC
//TODO - ADICIONAR ORIGIN PUBSUB

//TODO - CONFIGURAR BULL BOARD
//TODO - SUBIR VERSAO PARA NESTJS 11