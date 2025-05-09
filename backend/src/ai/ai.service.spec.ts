import { Test, TestingModule } from '@nestjs/testing';
import { AiGateway } from './ai.gateway';
import { AiService } from './ai.service';
import { Server } from 'socket.io';

describe('AiGateway', () => {
  let gateway: AiGateway;
  let aiService: AiService;
  let mockServer: Partial<Server>;

  beforeEach(async () => {
    // mock server
    mockServer = {
      on: jest.fn(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiGateway, AiService],
    }).compile();

    gateway = module.get<AiGateway>(AiGateway);
    aiService = module.get<AiService>(AiService);

    // set the mock server
    Object.defineProperty(gateway, 'server', {
      value: mockServer,
      writable: true,
    });
  });

  it('should handle incoming messages and emit chunks', async () => {
    const mockClient = {
      id: 'test-client',
      emit: jest.fn(),
    };

    gateway.handleConnection(mockClient as any);

    const testResponse =
      'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
    jest.spyOn(aiService, 'generateResponse').mockResolvedValue({
      response: testResponse,
    });

    await gateway.handleMessage(mockClient as any, { message: 'test message' });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const emitCalls = mockClient.emit.mock.calls;

    const chunkCalls = emitCalls.filter((call) => call[0] === 'aiResponse');
    expect(chunkCalls.length).toBe(2);

    expect(chunkCalls[0][1]).toEqual({
      chunk: 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10',
    });
    expect(chunkCalls[1][1]).toEqual({
      chunk: 'word11 word12',
    });

    expect(mockClient.emit).toHaveBeenCalledWith('aiResponseComplete');
  });

  it('should handle connection', () => {
    const mockClient = {
      id: 'test-client',
    };
    gateway.handleConnection(mockClient as any);
    expect(gateway['connectedClients'].has('test-client')).toBe(true);
  });

  it('should handle disconnection', () => {
    const mockClient = {
      id: 'test-client',
      emit: jest.fn(),
    };
    gateway.handleConnection(mockClient as any);
    gateway.handleDisconnect(mockClient as any);
    expect(gateway['connectedClients'].has('test-client')).toBe(false);
    expect(mockClient.emit).toHaveBeenCalledWith('aiResponseComplete');
  });

  it('should handle errors gracefully', async () => {
    const mockClient = {
      id: 'test-client',
      emit: jest.fn(),
    };

    gateway.handleConnection(mockClient as any);

    // mock the aiService to throw an error
    jest
      .spyOn(aiService, 'generateResponse')
      .mockRejectedValue(new Error('Test error'));

    await gateway.handleMessage(mockClient as any, { message: 'test message' });

    expect(mockClient.emit).toHaveBeenCalledWith('aiError', {
      message: 'Failed to process your request',
      error: 'Test error',
    });
  });

  it('should stop sending chunks if client disconnects', async () => {
    const mockClient = {
      id: 'test-client',
      emit: jest.fn(),
    };

    gateway.handleConnection(mockClient as any);

    const testResponse = Array(30).fill('word').join(' ');
    jest.spyOn(aiService, 'generateResponse').mockResolvedValue({
      response: testResponse,
    });

    const messagePromise = gateway.handleMessage(mockClient as any, {
      message: 'test message',
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    gateway.handleDisconnect(mockClient as any);

    await messagePromise;

    const emitCalls = mockClient.emit.mock.calls;
    const chunkCalls = emitCalls.filter((call) => call[0] === 'aiResponse');

    expect(chunkCalls.length).toBeGreaterThanOrEqual(1);
    expect(chunkCalls.length).toBeLessThanOrEqual(2);

    expect(chunkCalls[0][1]).toEqual({
      chunk: expect.stringContaining('word'),
    });
  });
});
