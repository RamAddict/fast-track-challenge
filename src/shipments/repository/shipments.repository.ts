import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../db/database.provider';
import * as schema from '../../db/schema';

@Injectable()
export class ShipmentsRepository {
    constructor(
        @Inject(DRIZZLE_CLIENT)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async create(data: typeof schema.shipments.$inferInsert) {
        return this.db
            .insert(schema.shipments)
            .values(data)
            .returning();
    }

    async findById(id: string) {
        return this.db.query.shipments.findFirst({
            where: eq(schema.shipments.id, id),
        });
    }

    async findAll() {
        return this.db.query.shipments.findMany();
    }
}