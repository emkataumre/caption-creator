import { Test, TestingModule } from '@nestjs/testing';
import { AiGateway } from './ai.gateway';
import { AiService } from './ai.service';

describe('AiGateway', () => {
  let gateway: AiGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiGateway, AiService],
    }).compile();

    gateway = module.get<AiGateway>(AiGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
