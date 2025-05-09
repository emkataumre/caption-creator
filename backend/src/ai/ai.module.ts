import { Module } from '@nestjs/common';
import { AiGateway } from './ai.gateway';
import { AiService } from './ai.service';

@Module({
  providers: [AiGateway, AiService],
})
export class AiModule {}
