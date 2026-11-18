import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MockAiProvider } from './providers/mock-ai.provider';
import { ClaudeAiProvider } from './providers/claude-ai.provider';
import { AI_PROVIDER } from './providers/ai-provider.interface';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    {
      // Real Claude when a key is configured; otherwise the mock, so the app
      // (and its demo) keeps working without one.
      provide: AI_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('ANTHROPIC_API_KEY');
        if (!apiKey) {
          new Logger('AiModule').warn('ANTHROPIC_API_KEY not set: using MockAiProvider');
          return new MockAiProvider();
        }
        return new ClaudeAiProvider(new Anthropic({ apiKey }));
      },
    },
  ],
})
export class AiModule {}
