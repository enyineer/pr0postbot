import { Prisma, PrismaClient } from '@prisma/client';

export class Pr0grammItemService {
    private readonly prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(data: Prisma.Pr0grammItemCreateInput) {
        const existingItem = await this.prisma.pr0grammItem.findUnique({
            where: {
                id: data.id
            }
        });

        if (existingItem !== null) {
            return existingItem;
        }
        
        return await this.prisma.pr0grammItem.create({ data });
    }

    async findUnique(where: Prisma.Pr0grammItemWhereUniqueInput) {
        return await this.prisma.pr0grammItem.findUnique({ where });
    }

    async update(update: Prisma.Pr0grammItemUpdateArgs) {
        return await this.prisma.pr0grammItem.update(update)
    }

    async delete(where: Prisma.Pr0grammItemWhereUniqueInput) {
        return await this.prisma.pr0grammItem.delete({ where });
    }
}