import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { CreateSaleInputSchema } from '../schemas/inputs';
import { SaleOutputSchema } from '../schemas/outputs';
import { RestrictedGuard } from '../../common';
import { UseGuards } from '@nestjs/common';
import { CancelSalesService, CreateSalesService } from '../services';
import { OriginSalesEnum } from '../../../contracts/enums/sales.enum';

@Resolver()
@UseGuards(RestrictedGuard)
export class SalesResolver {
  constructor(
      private readonly createSalesService: CreateSalesService,
      private readonly cancelSalesService: CancelSalesService,
    ) {}

  @Mutation(() => SaleOutputSchema, { name: 'createSale' })
  async createSale(
    @Args('input') createSalesDto: CreateSaleInputSchema,
  ): Promise<SaleOutputSchema> {
    createSalesDto.origin = OriginSalesEnum.GRAPHQL
    return this.createSalesService.create(createSalesDto);
  }

  @Mutation(() => SaleOutputSchema, { name: 'cancelSale' })
  async cancelSale(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<SaleOutputSchema> {
    // TODO - PRECISAR ADICIONAR ORIGIN, E NAO VAI USAR ID, VAI USAR AUTHORIZATION_CODE E DATA DA VENDA
    return this.cancelSalesService.cancel(id);
  }
}
