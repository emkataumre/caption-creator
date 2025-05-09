import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AiService } from './ai.service';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './interfaces/message.interface';

interface AiResponse {
  response: string;
}

interface AiError {
  message: string;
  error: string;
}

interface ClientPayload {
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
})
export class AiGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AiGateway.name);
  private readonly connectedClients: Map<string, Socket> = new Map();

  constructor(private readonly aiService: AiService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
    client.emit('aiResponseComplete');
  }

  @SubscribeMessage('askAi')
  async handleMessage(client: Socket, payload: ClientPayload): Promise<void> {
    try {
      const message: Message = {
        id: uuidv4(),
        content: payload.message,
        timestamp: new Date(),
        clientId: client.id,
      };

      this.logger.log(
        [
          'Received message:',
          `ID: [${message.id}]`,
          `From: ${message.clientId}`,
          `At: ${message.timestamp.toLocaleString()}`,
          `Content: ${message.content}`,
        ].join('\n    '),
      );

      const response: AiResponse = await this.aiService.generateResponse(
        message.content,
      );

      const chunks: string[] = this.chunkResponse(response.response);

      for (const chunk of chunks) {
        if (!this.connectedClients.has(client.id)) {
          this.logger.warn(
            `Client ${client.id} disconnected during response streaming`,
          );
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        client.emit('aiResponse', { chunk });
      }

      if (this.connectedClients.has(client.id)) {
        client.emit('aiResponseComplete');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error handling message: ${errorMessage}`);
      const aiError: AiError = {
        message: 'Failed to process your request',
        error: errorMessage,
      };
      client.emit('aiError', aiError);
    }
  }

  private chunkResponse(response: string): string[] {
    const words: string[] = response.split(' ');
    const chunks: string[] = [];
    const chunkSize = 10;

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk: string = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
    }

    return chunks;
  }
}

3;
