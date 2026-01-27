import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, ilike, count, SQL, sql } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../db/database.provider';
import * as schema from '../../db/schema';
import { EShipmentStatus } from '../interfaces/shipment.interface';

export interface FindAllOptions {
    page: number;
    limit: number;
    status?: EShipmentStatus;
    customerName?: string;
}

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
        const result = await this.db.query.shipments.findFirst({
            where: eq(schema.shipments.id, id),
        });

        if (!result) return undefined;

        return {
            ...result,
            status: result.status as EShipmentStatus,
        };
    }

    async findAll(options: FindAllOptions) {
        const { page, limit, status, customerName } = options;
        const offset = (page - 1) * limit;

        // Build where conditions
        const conditions: SQL[] = [];

        if (status) {
            conditions.push(eq(schema.shipments.status, status));
        }

        if (customerName) {
            conditions.push(ilike(schema.shipments.customerName, `%${customerName}%`));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const results = await this.db
            .select({
                id: schema.shipments.id,
                orderId: schema.shipments.orderId,
                customerName: schema.shipments.customerName,
                destination: schema.shipments.destination,
                status: schema.shipments.status,
                lastSyncedAt: schema.shipments.lastSyncedAt,
                createdAt: schema.shipments.createdAt,
                totalCount: sql<number>`count(*) over()`.as('total_count'),
            })
            .from(schema.shipments)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(schema.shipments.createdAt);

        // Extract total from first row, or 0 if no results
        const total = results.length > 0 ? Number(results[0].totalCount) : 0;

        // Remove the totalCount from each row and cast status to enum
        const data = results.map(({ totalCount, ...shipment }) => ({
            ...shipment,
            status: shipment.status as EShipmentStatus,
        }));

        return {
            data,
            total,
        };
    }
}