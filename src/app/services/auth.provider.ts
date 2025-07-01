import {inject} from '@angular/core';
import {AuthService} from './auth.service';
import { makeEnvironmentProviders } from '@angular/core';
import { provideAppInitializer } from '@angular/core';

export function initializeAuthService(): Promise<void> {
  const authService = inject(AuthService);
  return authService.init();
}

export function provideAuthService() {
  return makeEnvironmentProviders([
    provideAppInitializer(() => initializeAuthService())
  ]);
}


