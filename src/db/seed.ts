import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';
import { shipments } from './schema';

// Load environment variables
dotenv.config();

/**
 * Sample shipment data for seeding the database
 */
const sampleShipments = [
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    orderId: 'ORD-2026-001',
    customerName: 'Maria Silva',
    destination: 'Rua das Flores, 123 - Rio de Janeiro, RJ, 20000-000',
    status: 'pending' as const,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    orderId: 'ORD-2026-002',
    customerName: 'João Santos',
    destination: 'Av. Paulista, 1000 - São Paulo, SP, 01310-100',
    status: 'delivered' as const,
  },
];

/**
 * Main seed function
 */
async function seed() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🌱 Starting database seeding...');

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL');
    client.release();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing shipments...');
    await db.delete(shipments);

    // Insert sample data
    console.log('📦 Inserting sample shipments...');
    const insertedShipments = await db
      .insert(shipments)
      .values(sampleShipments)
      .returning();

    console.log(
      `✅ Successfully inserted ${insertedShipments.length} shipments`,
    );
    console.log('\n📊 Seeding Summary:');
    console.log(`   - Total shipments: ${insertedShipments.length}`);

    // Count by status
    const statusCounts = insertedShipments.reduce(
      (acc, shipment) => {
        acc[shipment.status] = (acc[shipment.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('👋 Database connection closed');
  }
}

// Run the seed function
seed();
