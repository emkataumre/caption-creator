import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prompt-suggestions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prompt-suggestions.component.html',
  styleUrl: './prompt-suggestions.component.scss',
})
export class PromptSuggestionsComponent {
  @Input() title?: string;
  @Input() icon?: string;
  @Input() prompt?: string;
  @Input() isDisabled = false;
  @Output() onClick = new EventEmitter<string>();

  handleClick() {
    if (this.prompt && !this.isDisabled) {
      this.onClick.emit(this.prompt);
    }
  }
}
