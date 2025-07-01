import { APP_INITIALIZER, Provider } from '@angular/core';
import {AuthService} from './auth.service';

export function initializeAuthService(authService: AuthService): () => Promise<void> {
  return () => authService.init();
}

export const provideAuthService: Provider = {
  provide: APP_INITIALIZER,
  useFactory: initializeAuthService,
  deps: [AuthService],
  multi: true
};
