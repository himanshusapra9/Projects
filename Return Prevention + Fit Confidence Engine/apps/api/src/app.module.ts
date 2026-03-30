import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { TenantKeysService } from './services/tenant-keys.service';
import { FitScoringService } from './services/fit-scoring.service';
import { RiskScoringService } from './services/risk-scoring.service';
import { RankingService } from './services/ranking.service';
import { OrchestrationService } from './services/orchestration.service';
import { MemoryStoreService } from './services/memory-store.service';
import { BehaviorIngestService } from './services/behavior-ingest.service';
import { CommunityFeedbackService } from './services/community-feedback.service';
import { FitConfidenceController } from './routes/fit-confidence.controller';
import { SizeRecommendationController } from './routes/size-recommendation.controller';
import { ReturnRiskController } from './routes/return-risk.controller';
import { RecommendationController } from './routes/recommendation.controller';
import { AlternativesController } from './routes/alternatives.controller';
import { FiltersController } from './routes/filters.controller';
import { MemoryController } from './routes/memory.controller';
import { BehaviorController } from './routes/behavior.controller';
import { CommunityController } from './routes/community.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
  ],
  controllers: [
    FitConfidenceController,
    SizeRecommendationController,
    ReturnRiskController,
    RecommendationController,
    AlternativesController,
    FiltersController,
    MemoryController,
    BehaviorController,
    CommunityController,
  ],
  providers: [
    TenantKeysService,
    FitScoringService,
    RiskScoringService,
    RankingService,
    OrchestrationService,
    MemoryStoreService,
    BehaviorIngestService,
    CommunityFeedbackService,
    TenantMiddleware,
    RateLimitMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware, RateLimitMiddleware)
      .exclude(
        { path: 'docs', method: RequestMethod.GET },
        { path: 'docs', method: RequestMethod.HEAD },
        { path: 'docs-json', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
