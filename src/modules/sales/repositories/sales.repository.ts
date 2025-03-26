import { Sales } from "@prisma/client";
import { PrismaService } from "../../common";

export class SalesRepository {
    constructor(private readonly prisma: PrismaService) {}
    
    public create(data: any): Promise<Sales> {
        return this.prisma.sales.create({
            data,
        });
    }

    public update(id: string, data: any): Promise<Sales> {
        return this.prisma.sales.update({
            where: {
                id
            },
            data,
        });
    }
}