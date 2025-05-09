import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorHandlingService, ErrorSeverity } from './error-handling.service';

export enum LoadingStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum LoadingKey {
  MESSAGE_INPUT = 'MESSAGE_INPUT',
  SUGGESTIONS = 'SUGGESTIONS',
  MESSAGE_LIST = 'MESSAGE_LIST',
  AI_RESPONSE = 'AI_RESPONSE',
  SUGGESTION_BUTTONS = 'SUGGESTION_BUTTONS',
}

export interface LoadingState {
  status: LoadingStatus;
}

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingMap = new Map<string, LoadingState>();
  private loadingSubject = new BehaviorSubject<Map<string, LoadingState>>(
    new Map()
  );

  loading$ = this.loadingSubject.asObservable();

  constructor(private errorHandlingService: ErrorHandlingService) {
    this.loading$.subscribe(state => {
      if (Object.keys(state).length > 0) {
        console.log('Loading State Changed:', Object.fromEntries(state));
      }
    });
  }

  setLoading(key: string, status: LoadingStatus) {
    const state: LoadingState = {
      status,
    };

    this.loadingMap.set(key, state);
    this.loadingSubject.next(this.loadingMap);
    console.log(`Loading State Set - Key: ${key}, Status: ${status}`);
  }

  setError(key: string, error: string) {
    this.setLoading(key, LoadingStatus.ERROR);
    this.errorHandlingService.showError({
      message: error,
      severity: ErrorSeverity.ERROR,
      timestamp: new Date(),
      source: key,
    });
    console.log(`Error Set - Key: ${key}, Error: ${error}`);
  }

  getLoadingState(key: string): LoadingState | undefined {
    return this.loadingMap.get(key);
  }

  clearLoading(key: string) {
    this.loadingMap.delete(key);
    this.loadingSubject.next(this.loadingMap);
    console.log(`Loading State Cleared - Key: ${key}`);
  }

  isAnyLoading(): boolean {
    const result = Array.from(this.loadingMap.values()).some(
      state => state.status === LoadingStatus.LOADING
    );
    console.log('Is Any Loading:', result);
    return result;
  }
}
