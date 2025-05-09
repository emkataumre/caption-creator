import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { ErrorHandlingService, ErrorSeverity } from './error-handling.service';

interface AiResponse {
  chunk: string;
}

interface AiError {
  message: string;
  error: string;
}

interface ErrorEvent {
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  source: string;
  details?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket!: Socket;
  private aiResponsesSubject = new BehaviorSubject<string>('');
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 1000; // 1 second
  private reconnectTimeout: any;
  private aiResponseCompleteSubject = new Subject<void>();
  aiResponses$ = this.aiResponsesSubject.asObservable();
  aiResponseComplete$ = this.aiResponseCompleteSubject.asObservable();

  constructor(private errorService: ErrorHandlingService) {
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: this.RECONNECT_INTERVAL,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      this.errorService.showError({
        message: 'Successfully connected to server',
        severity: ErrorSeverity.INFO,
        timestamp: new Date(),
        source: 'WebsocketService',
      });
    });

    this.socket.on('connect_error', error => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;

      if (this.reconnectAttempts <= this.MAX_RECONNECT_ATTEMPTS) {
        this.errorService.showError({
          message: `Connection error. Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`,
          severity: ErrorSeverity.WARNING,
          timestamp: new Date(),
          source: 'WebsocketService',
        });
      } else {
        this.errorService.showError({
          message:
            'Maximum reconnection attempts reached. Please refresh the page.',
          severity: ErrorSeverity.ERROR,
          timestamp: new Date(),
          source: 'WebsocketService',
        });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;

      this.errorService.showError({
        message: 'Disconnected from server. Attempting to reconnect...',
        severity: ErrorSeverity.WARNING,
        timestamp: new Date(),
        source: 'WebsocketService',
      });
    });

    this.socket.on('aiResponseComplete', () => {
      this.aiResponseCompleteSubject.next();
    });

    this.socket.on('aiResponse', (data: AiResponse) => {
      this.handleResponse(data.chunk);
    });

    this.socket.on('aiError', (error: AiError) => {
      this.errorService.showError({
        message: error.message,
        severity: ErrorSeverity.ERROR,
        timestamp: new Date(),
        source: 'AI Service',
        details: error.error,
      });
      this.aiResponsesSubject.next('');
      this.aiResponseCompleteSubject.next();
    });
  }

  public reconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.socket.connect();
    }
  }

  sendMessage(message: string): void {
    if (!this.isConnected) {
      this.errorService.showError({
        message: 'Not connected to server. Please try again.',
        severity: ErrorSeverity.ERROR,
        timestamp: new Date(),
        source: 'WebsocketService',
      });
      return;
    }

    try {
      this.aiResponsesSubject.next('');
      this.socket.emit('askAi', { message });
    } catch (error) {
      if (this.isErrorEvent(error)) {
        this.errorService.showError(error);
      } else {
        this.errorService.showError({
          message: 'Failed to send message. Please try again.',
          severity: ErrorSeverity.ERROR,
          timestamp: new Date(),
          source: 'WebsocketService',
        });
      }
    }
  }

  handleResponse(chunk: string) {
    const currentResponse = this.aiResponsesSubject.value;
    const needsSpace =
      currentResponse &&
      !currentResponse.endsWith(' ') &&
      !chunk.startsWith(' ') &&
      !chunk.startsWith('.') &&
      !chunk.startsWith(',') &&
      !chunk.startsWith('!') &&
      !chunk.startsWith('?');

    this.aiResponsesSubject.next(
      currentResponse + (needsSpace ? ' ' : '') + chunk
    );
  }

  resetConnection() {
    this.aiResponsesSubject.next('');

    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  private isErrorEvent(error: unknown): error is ErrorEvent {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'severity' in error &&
      'timestamp' in error &&
      'source' in error
    );
  }
}
