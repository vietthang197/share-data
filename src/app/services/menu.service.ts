import {Injectable, OnInit, signal} from '@angular/core';
import {MenuItem, MenuItemCommandEvent} from 'primeng/api';
import {AuthService} from './auth.service';
import {AuthEvent} from '../event/auth-event';

@Injectable({
  providedIn: 'root'
})
export class MenuService implements OnInit, AuthEvent {

  menuItems = signal<MenuItem[]>([]);
  isAuthenticated = signal(false)
  currentUserName = signal<string | undefined>('');

  constructor(private authService: AuthService) {
    this.authService.registerAuthEvent(this);
  }

  onLogout(): void {
    this.isAuthenticated.set(this.authService.isAuthenticated());
  }

  onLoginSuccess(): void {
    this.isAuthenticated.set(this.authService.isAuthenticated());
    this.currentUserName.set(this.authService.getCurrentUser()?.email);
  }

  onRefreshTokenSuccess(): void {
    this.isAuthenticated.set(this.authService.isAuthenticated());
    this.currentUserName.set(this.authService.getCurrentUser()?.email);
  }

  onRefreshTokenFailure(): void {
    this.isAuthenticated.set(this.authService.isAuthenticated());
  }

  ngOnInit(): void {
    this.isAuthenticated.set(this.authService.isAuthenticated());
  }

  initMenu() {
    this.menuItems.set([
      {
        label: 'Home',
        icon: 'pi pi-home',
        url: '/',
        target: '_self'
      },
      {
        label: 'Note list',
        icon: 'pi pi-address-book',
        url: '/',
        target: '_self'
      },
      {
        label: 'Projects',
        icon: 'pi pi-search',
        items: [
          {
            label: 'Components',
            icon: 'pi pi-bolt'
          },
          {
            label: 'Blocks',
            icon: 'pi pi-server'
          },
          {
            label: 'UI Kit',
            icon: 'pi pi-pencil',
          },
          {
            label: 'Templates',
            icon: 'pi pi-palette',
            items: [
              {
                label: 'Apollo',
                icon: 'pi pi-palette'
              },
              {
                label: 'Ultima',
                icon: 'pi pi-palette',
              }
            ]
          }
        ]
      },
      {
        label: 'Contact',
        icon: 'pi pi-envelope',
      }
    ]);
  }

  getMenuUserInfo() {
    return [
      {
        label: 'Options',
        items: [
          {
            label: 'Information',
            icon: 'pi pi-server',
          },
          {
            label: 'Sign out',
            icon: 'pi pi-sign-out',
            command: (event: MenuItemCommandEvent)=>  {
              this.authService.logout();
            }
          }
        ]
      }
    ]
  }
}
