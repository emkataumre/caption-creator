import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  private readonly isInChatModeSubject = new BehaviorSubject<boolean>(false);
  public readonly isInChatMode$: Observable<boolean> =
    this.isInChatModeSubject.asObservable();

  constructor() {}

  public setChatMode(isInChatMode: boolean): void {
    this.isInChatModeSubject.next(isInChatMode);
  }

  public getChatMode(): boolean {
    return this.isInChatModeSubject.value;
  }
}
