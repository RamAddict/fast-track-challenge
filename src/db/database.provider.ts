import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE_CLIENT = 'DRIZZLE_CLIENT';

export const DatabaseProvider: Provider = {
    provide: DRIZZLE_CLIENT,
    inject: [ConfigService, PinoLogger],
    useFactory: async (configService: ConfigService, logger: PinoLogger) => {
        logger.setContext('DatabaseProvider');

        const connectionString = configService.get<string>('DATABASE_URL');
        const pool = new Pool({
            connectionString,
        });

        // Quick connection test
        try {
            const client = await pool.connect();
            logger.info('Successfully connected to PostgreSQL');
            client.release();
        } catch (e) {
            logger.error({ err: e }, 'Failed to connect to PostgreSQL');
            throw e;
        }

        return drizzle(pool, { schema });
    },
};