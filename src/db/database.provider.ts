import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE_CLIENT = 'DRIZZLE_CLIENT';

export const DatabaseProvider: Provider = {
    provide: DRIZZLE_CLIENT,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        const pool = new Pool({
            connectionString,
        });

        // Quick connection test
        try {
            const client = await pool.connect();
            console.log('Successfully connected to PostgreSQL');
            client.release();
        } catch (e) {
            console.error('Failed to connect to PostgreSQL:', e.message);
            throw e;
        }

        return drizzle(pool, { schema });
    },
};