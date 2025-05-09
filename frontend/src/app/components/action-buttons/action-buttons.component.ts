import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

interface ActionButton {
  icon: string;
  action: string;
  isLoading: boolean;
}

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss'],
})
export class ActionButtonsComponent {
  actions: ActionButton[] = [
    { icon: 'content_copy', action: 'copy', isLoading: false },
    { icon: 'thumb_up', action: 'like', isLoading: false },
    { icon: 'thumb_down', action: 'dislike', isLoading: false },
    { icon: 'refresh', action: 'regenerate', isLoading: false },
    { icon: 'volume_up', action: 'speak', isLoading: false },
  ];

  handleAction(action: string) {
    const actionButton = this.actions.find(a => a.action === action);
    if (!actionButton) return;
    actionButton.isLoading = true;

    const messageElement = (event?.target as HTMLElement)?.closest(
      '.chat__message'
    );
    const messageText =
      Array.from(messageElement?.childNodes || [])
        .find(node => node.nodeType === Node.TEXT_NODE)
        ?.textContent?.trim() || '';

    switch (action) {
      case 'copy':
        navigator.clipboard
          .writeText(messageText)
          .then(() => console.log('Text copied:', messageText))
          .catch(err => console.log('Failed to copy', err))
          .finally(() => {
            actionButton.isLoading = false;
            actionButton.icon = 'done';
            setTimeout(() => {
              actionButton.icon = 'content_copy';
            }, 1500);
          });
        break;

      case 'speak':
        const utterance = new SpeechSynthesisUtterance(messageText);
        window.speechSynthesis.speak(utterance);
        setTimeout(() => {
          actionButton.isLoading = false;
        }, 500);
        actionButton.icon = 'done';
        setTimeout(() => {
          actionButton.icon = 'volume_up';
        }, 1500);
        break;

      case 'like':
      case 'dislike':
        const icon = actionButton.icon;
        actionButton.icon = icon.includes('_off_alt')
          ? icon.replace('_off_alt', '')
          : icon.replace('thumb_', 'thumb_') + '_off_alt';
        setTimeout(() => (actionButton.isLoading = false), 500);
        break;

      case 'regenerate':
        setTimeout(() => (actionButton.isLoading = false), 2000);
        break;
    }
  }
}
