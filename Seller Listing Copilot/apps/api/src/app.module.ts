import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import aiConfig from './config/ai.config';
import { DatabaseModule } from './config/database.module';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';
import { EvidenceModule } from './evidence/evidence.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { ListingPackagesModule } from './listing-packages/listing-packages.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProductsModule } from './products/products.module';
import { PublishModule } from './publish/publish.module';
import { QueueModule } from './queue/queue.module';
import { ReviewModule } from './review/review.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, storageConfig, aiConfig],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    QueueModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    IngestionModule,
    ProductsModule,
    EvidenceModule,
    ReviewModule,
    AiModule,
    ListingPackagesModule,
    PublishModule,
    StorageModule,
    AuditModule,
    AnalyticsModule,
    MonitoringModule,
  ],
})
export class AppModule {}
