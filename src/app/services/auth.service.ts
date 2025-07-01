import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {firstValueFrom, Observable, of, Subscription, switchMap, timer} from 'rxjs';
import {BaseResponse} from '../dto/base-response';
import {LoginResponse} from '../dto/login-response';
import {LoginRequest} from '../dto/login-request';
import {CookieService} from './cookie.service';
import {jwtDecode, JwtPayload} from "jwt-decode";
import {UserAccount} from '../dto/user-account';
import {Router} from '@angular/router';
import {AuthEvent} from '../event/auth-event';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private refreshTokenJob: Subscription | null = null;
  private authEventRegisterList: AuthEvent[] = [];
  private accessToken: string | null = null;

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) { }

  signup(request: string) : Observable<BaseResponse> {
    return this.http.post<BaseResponse>(environment.API_ENDPOINT +'/api/v1/auth/register', request, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  login(request: LoginRequest) : Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.API_ENDPOINT +'/api/v1/auth/login', request, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      switchMap(loginResponse => {
        if (loginResponse && loginResponse.status == 200) {
          this.storeRefreshToken(loginResponse);
          this.storeAccessToken(loginResponse.accessToken);
          const decodedToken = jwtDecode<JwtPayload>(loginResponse.accessToken);
          const refreshToken = loginResponse.refreshToken;
          if (decodedToken && decodedToken.exp) {
            const calTime = decodedToken.exp * 1000 - Date.now() - 10000;
            if (this.refreshTokenJob) {
              this.refreshTokenJob.unsubscribe();
            }
            this.refreshTokenJob = timer(calTime).pipe(
              switchMap(async () => {
                // Gọi lại chính nó (chú ý tránh stack overflow nếu lỗi)
                const response = await this.refreshToken(refreshToken);
                return of(null);
              })
            ).subscribe(() => {
              console.log('Call refreshToken done!');
            });
          }
          this.authEventRegisterList.forEach(event => {
            event.onLoginSuccess();
          })
        }
        return of(loginResponse);
      })
    )
  }

  storeRefreshToken(loginResponse: LoginResponse) {
    const decodedToken = jwtDecode<JwtPayload>(loginResponse.refreshToken);
    if (decodedToken.exp) {
      this.cookieService.set("refreshToken", loginResponse.refreshToken, decodedToken.exp * 1000);
    }
  }

  getRefreshToken() {
    return this.cookieService.get('refreshToken');
  }

  storeAccessToken(accessToken?: string) {
    if (accessToken) {
      this.accessToken = accessToken;
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    if (this.accessToken) {
      const decodedToken = jwtDecode<JwtPayload>(this.accessToken);
      if (decodedToken) {
        const now = Date.now();
        return !(!decodedToken.exp || (now / 1000) > decodedToken.exp);
      } else
        return false;
    } else
      return false;
  }

  getCurrentUser(): UserAccount | null {
    if (!this.isAuthenticated()) {
      return null;
    } else {
      const accessToken = this.accessToken;
      if (accessToken) {
        const decodedToken = jwtDecode<JwtPayload>(accessToken);
        if (decodedToken) {
          return {
            email: decodedToken.sub
          };
        } else
          return null;
      } else
        return null;
    }
  }

  async refreshToken(refreshToken: string | null): Promise<void> {
    try {
      if (!refreshToken) {
        this.removeAccessToken();
        this.removeRefreshToken();
        await this.router.navigateByUrl('/login', { skipLocationChange: true });
      } else {
        const res = await firstValueFrom(
          this.http.post<{ accessToken?: string; status?: number; message?: string }>(
            environment.API_ENDPOINT + '/api/v1/auth/refresh-token',
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          )
        );

        if (res.status === 200) {
          this.authEventRegisterList.forEach(event => {
            event.onRefreshTokenSuccess();
          });

          const newToken = res.accessToken;
          this.storeAccessToken(newToken);

          if (newToken) {
            const decodedToken = jwtDecode<JwtPayload>(newToken);
            if (decodedToken.exp) {
              const calTime = decodedToken.exp * 1000 - Date.now() - 10000;
              if (this.refreshTokenJob) {
                this.refreshTokenJob.unsubscribe();
              }
              this.refreshTokenJob = timer(calTime).pipe(
                switchMap(() => {
                  // Gọi lại chính nó (chú ý tránh stack overflow nếu lỗi)
                  this.refreshToken(refreshToken);
                  return of(null);
                })
              ).subscribe(() => {
                console.log('Call refreshToken done!');
              });
            }
          }

        } else {
          this.authEventRegisterList.forEach(event => {
            event.onRefreshTokenFailure();
          });

          this.removeAccessToken();
          this.removeRefreshToken();
          await this.router.navigateByUrl('/login', { skipLocationChange: true });
        }
      }
    } catch (err) {
      console.error('Refresh token thất bại:', err);
      this.removeAccessToken();
      this.removeRefreshToken();
      await this.router.navigateByUrl('/login', { skipLocationChange: true });

      this.authEventRegisterList.forEach(event => {
        event.onRefreshTokenFailure();
      });
    }
  }

  removeAccessToken() {
    this.accessToken = null;
  }

  removeRefreshToken() {
    this.cookieService.delete("refreshToken");
  }

  logout() {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.authEventRegisterList.forEach(event => {
      event.onLogout();
    })
    this.router.navigateByUrl('/login').then(() => {
    });
  }

  registerAuthEvent(authEvent: AuthEvent){
    this.authEventRegisterList.push(authEvent);
  }

  init() {
    return Promise.resolve(this.refreshToken(this.getRefreshToken()));
  }
}
