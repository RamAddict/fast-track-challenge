import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('shipment_status', [
  'pending',
  'in_transit',
  'delivered',
  'failed',
]);

export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: text('order_id').notNull().unique(),
  customerName: text('customer_name').notNull(),
  destination: text('destination').notNull(),
  status: statusEnum('status').default('pending').notNull(),
  lastSyncedAt: timestamp('last_synced_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
