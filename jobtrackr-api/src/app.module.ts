import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './modules/profile/profile.module';
import { HealthModule } from './modules/health/health.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    HealthModule,
    AuthModule,
    ApplicationsModule,
    DashboardModule,
    ProfileModule,
    AiModule,
  ],
  providers: [],
})
export class AppModule {}
