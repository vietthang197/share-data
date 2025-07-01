import {Injectable, OnInit, signal} from '@angular/core';
import {MenuItem, MenuItemCommandEvent} from 'primeng/api';
import {AuthService} from './auth.service';
import {AuthEvent} from '../event/auth-event';

@Injectable({
  providedIn: 'root'
})
export class MenuService implements OnInit, AuthEvent {

  menuItems = signal<MenuItem[]>([]);

  constructor(private authService: AuthService) {
    this.authService.registerAuthEvent(this);
  }

  onLogout(): void {

  }

  onLoginSuccess(): void {

  }

  onRefreshTokenSuccess(): void {

  }

  onRefreshTokenFailure(): void {

  }

  ngOnInit(): void {

  }

  initMenu() {
    this.menuItems.set([
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: ['/']
      },
      {
        label: 'Note list',
        icon: 'pi pi-address-book',
        routerLink: ['/']
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
