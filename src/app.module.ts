import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { ShipmentsModule } from './shipments/shipments.module';
import { DatabaseModule } from './db/database.module';
import { loggerConfig } from './logger/logger.config';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot(loggerConfig),
    QueueModule,
    DatabaseModule,
    ShipmentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
