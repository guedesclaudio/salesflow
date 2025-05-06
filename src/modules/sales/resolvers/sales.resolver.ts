import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { OriginSalesEnum } from '../../../contracts/enums/sales.enum';
import { RestrictedGuard } from '../../common';
import { CreateSaleInputSchema, PaySaleInputSchema } from '../schemas/inputs';
import { SaleOutputSchema } from '../schemas/outputs';
import { CancelSalesService, CreateSalesService, PaySalesService } from '../services';

@Resolver()
@UseGuards(RestrictedGuard)
export class SalesResolver {
  constructor(
    private readonly createSalesService: CreateSalesService,
    private readonly cancelSalesService: CancelSalesService,
    private readonly paySalesService: PaySalesService,
  ) {}

  @Mutation(() => Boolean, { name: 'createSale' })
  async createSale(
    @Args('input') createSalesDto: CreateSaleInputSchema,
    @Context() context: any,
  ): Promise<boolean> {
    createSalesDto.origin = OriginSalesEnum.GRAPHQL;
    createSalesDto.clientId = context.req.clientId;
    return this.createSalesService.enqueue(createSalesDto);
  }

  @Mutation(() => Boolean, { name: 'paySale' })
  async paySale(
    @Args('input') paySalesDto: PaySaleInputSchema,
    @Context() context: any,
  ): Promise<boolean> {
    paySalesDto.clientId = context.req.clientId;
    return this.paySalesService.enqueue(paySalesDto);
  }

  @Mutation(() => SaleOutputSchema, { name: 'cancelSale' })
  async cancelSale(@Args('id', { type: () => Int }) id: number): Promise<SaleOutputSchema> {
    // TODO - PRECISAR ADICIONAR ORIGIN, E NAO VAI USAR ID, VAI USAR AUTHORIZATION_CODE E DATA DA VENDA
    return this.cancelSalesService.cancel(id);
  }
}
