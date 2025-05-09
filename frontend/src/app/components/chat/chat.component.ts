import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFieldComponent } from '../input-field/input-field.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';
import {
  LoadingKey,
  LoadingService,
  LoadingStatus,
} from '../../services/loading.service';

interface Message {
  text: string;
  isUser: boolean;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    InputFieldComponent,
    ActionButtonsComponent,
    MatProgressBarModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @Input() initialMessage?: string;
  messages: Message[] = [];
  isTyping = false;
  private subscription: Subscription;
  private completeSubscription: Subscription;
  private shouldScroll = false;

  // make LoadingKey available in template
  protected readonly LoadingKey = LoadingKey;

  constructor(
    private websocketService: WebsocketService,
    private loadingService: LoadingService
  ) {
    // websocket response subscription
    this.subscription = this.websocketService.aiResponses$.subscribe(
      response => {
        if (response !== '') {
          const lastMessage = this.messages[this.messages.length - 1];
          if (lastMessage && !lastMessage.isUser) {
            lastMessage.text = response;
            lastMessage.isTyping = false;
            this.shouldScroll = true;
          }
        }
      }
    );

    // handle completion of AI response
    this.completeSubscription =
      this.websocketService.aiResponseComplete$.subscribe(() => {
        this.loadingService.setLoading(
          LoadingKey.AI_RESPONSE,
          LoadingStatus.SUCCESS
        );
        this.isTyping = false;
      });
  }

  ngOnInit() {
    if (this.initialMessage) {
      this.loadingService.setLoading(
        LoadingKey.AI_RESPONSE,
        LoadingStatus.LOADING
      );

      this.messages = [
        {
          text: this.initialMessage,
          isUser: true,
        },
        {
          text: '',
          isUser: false,
          isTyping: true,
        },
      ];
      this.websocketService.sendMessage(this.initialMessage);
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (e) {
      console.log('Error scrolling to bottom', e);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.completeSubscription) {
      this.completeSubscription.unsubscribe();
    }
  }

  onMessageSubmit(message: string) {
    if (message.trim()) {
      this.loadingService.setLoading(
        LoadingKey.AI_RESPONSE,
        LoadingStatus.LOADING
      );

      this.messages.push({ text: message, isUser: true });
      this.messages.push({ text: '', isUser: false, isTyping: true });

      this.isTyping = true;
      this.websocketService.sendMessage(message);
      this.shouldScroll = true;
    }
  }

  checkIsLoading(key: LoadingKey): boolean {
    return (
      this.loadingService.getLoadingState(key)?.status === LoadingStatus.LOADING
    );
  }
}
