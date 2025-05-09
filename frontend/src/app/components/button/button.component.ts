import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() variant?:
    | 'default'
    | 'search'
    | 'send-landing'
    | 'send-chat'
    | 'action' = 'default';
  @Input() icon?: string;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() isActive = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
