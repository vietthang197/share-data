export interface AuthEvent {
  onLogout(): void;
  onLoginSuccess(): void;
  onRefreshTokenSuccess(): void;
  onRefreshTokenFailure(): void;
}
