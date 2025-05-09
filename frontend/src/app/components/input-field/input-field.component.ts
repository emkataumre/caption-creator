import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import {
  LoadingService,
  LoadingKey,
  LoadingStatus,
} from '../../services/loading.service';

export interface InputFieldProps {
  variant?: 'landing' | 'chat';
  disabled?: boolean;
}

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss'],
})
export class InputFieldComponent implements AfterViewInit {
  @Input() variant: 'landing' | 'chat' = 'landing';
  @Input() disabled = false;
  @Output() onSubmit = new EventEmitter<string>();
  @ViewChild('autoResizeTextarea') textarea!: ElementRef<HTMLTextAreaElement>;
  promptText = '';
  isSearchActive = false;

  // make LoadingKey available in template
  protected readonly LoadingKey = LoadingKey;

  constructor(private loadingService: LoadingService) {}

  ngAfterViewInit() {
    this.adjustTextareaHeight();

    this.textarea.nativeElement.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey && !this.disabled) {
          event.preventDefault(); // prevents new line
          this.submitPrompt();
        }
      }
    );
  }

  @HostListener('input')
  onInput() {
    this.adjustTextareaHeight();
  }

  private adjustTextareaHeight() {
    const textarea = this.textarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
  }

  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
  }

  submitPrompt() {
    if (!this.disabled && this.promptText.trim()) {
      const textToSubmit = this.promptText;
      this.promptText = '';
      this.adjustTextareaHeight();

      setTimeout(() => {
        this.adjustTextareaHeight();
      }, 0);

      this.onSubmit.emit(textToSubmit);
    }
  }

  // Helper method for template
  checkIsLoading(key: LoadingKey): boolean {
    return (
      this.loadingService.getLoadingState(key)?.status === LoadingStatus.LOADING
    );
  }
}
