import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFieldComponent } from '../input-field/input-field.component';
import { PromptSuggestionsComponent } from '../prompt-suggestions/prompt-suggestions.component';
import { ChatComponent } from '../chat/chat.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChatStateService } from '../../services/chat-state.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  LoadingService,
  LoadingKey,
  LoadingStatus,
} from '../../services/loading.service';
import { WebsocketService } from '../../services/websocket.service';

interface Message {
  text: string;
  isUser: boolean;
}

interface Suggestion {
  title: string;
  icon: string;
  prompt: string;
}

@Component({
  selector: 'app-caption-creator',
  standalone: true,
  imports: [
    CommonModule,
    InputFieldComponent,
    PromptSuggestionsComponent,
    ChatComponent,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './caption-creator.component.html',
  styleUrls: ['./caption-creator.component.scss'],
})
export class CaptionCreatorComponent {
  protected readonly LoadingKey = LoadingKey;

  isInChatMode = false;
  messages: Message[] = [];
  selectedPromptIndex: number | null = null;

  constructor(
    private chatStateService: ChatStateService,
    private loadingService: LoadingService,
    private websocketService: WebsocketService
  ) {
    this.chatStateService.isInChatMode$.subscribe(
      isInChatMode => (this.isInChatMode = isInChatMode)
    );
  }

  suggestions: Suggestion[] = [
    {
      title: 'Promotional',
      icon: 'campaign',
      prompt: 'Create a promotional post for my product...',
    },
    {
      title: 'Product Launch',
      icon: 'rocket_launch',
      prompt: 'Write a product launch announcement...',
    },
    {
      title: 'Get Engagement',
      icon: 'favorite',
      prompt: 'Create an engaging post to increase interaction...',
    },
    {
      title: 'Announce a Sale',
      icon: 'local_offer',
      prompt: 'Write a post announcing a special sale...',
    },
  ];

  onPromptSelect(prompt: string, index: number) {
    this.selectedPromptIndex = index;
    this.handlePromptSubmit(prompt);
  }

  handlePromptSubmit(prompt: string) {
    this.chatStateService.setChatMode(true);
    this.messages.push({
      text: prompt,
      isUser: true,
    });
  }

  resetToLanding() {
    this.loadingService.setLoading(
      LoadingKey.AI_RESPONSE,
      LoadingStatus.LOADING
    );

    this.websocketService.resetConnection();

    setTimeout(() => {
      this.chatStateService.setChatMode(false);
      this.messages = [];
      this.loadingService.setLoading(
        LoadingKey.AI_RESPONSE,
        LoadingStatus.SUCCESS
      );
      this.selectedPromptIndex = null;
    }, 500);
  }

  checkIsLoading(key: LoadingKey): boolean {
    return (
      this.loadingService.getLoadingState(key)?.status === LoadingStatus.LOADING
    );
  }
}
