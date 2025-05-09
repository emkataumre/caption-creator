import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

interface AppError {
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  code?: string;
  details?: unknown;
  source?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  constructor(private snackBar: MatSnackBar) {}

  private errorSubject = new BehaviorSubject<AppError | null>(null);
  error$ = this.errorSubject.asObservable();

  private errorHistorySubject = new BehaviorSubject<AppError[]>([]);
  errorHistory$ = this.errorHistorySubject.asObservable();

  private destroy$ = new Subject<void>();

  showError(error: AppError): void {
    this.errorSubject.next(error);
    const currentHistory = this.errorHistorySubject.value;
    this.errorHistorySubject.next([...currentHistory, error]);

    this.snackBar.open(error.message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`snackbar-${error.severity}`],
    });

    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  clearErrorHistory(): void {
    this.errorHistorySubject.next([]);
  }
}
