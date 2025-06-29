import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  set(name: string, value: string, expiresAt?: number, path: string = '/'): void {
    let expires = '';
    if (expiresAt) {
      const date = new Date(expiresAt);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=${path}`;
  }

  get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  }

  delete(name: string, path: string = '/'): void {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; path=${path}`;
  }

  exists(name: string): boolean {
    return this.get(name) !== null;
  }

  getAll(): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    if (!document.cookie) return result;

    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [rawKey, ...rawVal] = cookie.trim().split('=');
      result[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal.join('='));
    }
    return result;
  }
}
