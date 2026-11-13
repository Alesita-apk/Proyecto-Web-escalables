import { HttpErrorResponse } from '@angular/common/http';

export const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof HttpErrorResponse) {
    const message = (error.error as { message?: unknown } | null)?.message;
    if (typeof message === 'string') return message;
  }
  return fallback;
};
