import {Injectable, OnDestroy, OnInit, signal} from '@angular/core';
import {MenuItem, MenuItemCommandEvent} from 'primeng/api';
import {AuthService} from './auth.service';
import {EventBusService} from './event-bus.service';
import {EventBusTypeEnum} from '../dto/event-bus-type-enum';
import {EventBusMessage} from '../dto/event-bus-message';
import {Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService implements OnInit, OnDestroy {

  menuItems = signal<MenuItem[]>([]);
  private subscriptions: Subscription[] = [];

  constructor(private authService: AuthService, private eventBusService: EventBusService) {
    this.subscriptions.push(
      this.eventBusService.events$.subscribe((eventData: EventBusMessage) => {
        switch (eventData.type) {
          case EventBusTypeEnum.LOGIN_SUCCESS:
          case EventBusTypeEnum.REFRESH_TOKEN_SUCCESS:
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
                label: 'Contact',
                icon: 'pi pi-envelope',
                routerLink: ['/contact']
              }
            ])
            break;
          case EventBusTypeEnum.LOGOUT:
          case EventBusTypeEnum.LOGIN_FAIL:
          case EventBusTypeEnum.REFRESH_TOKEN_FAIL:
            this.menuItems.set([])
            break;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {

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
            command: (event: MenuItemCommandEvent) => {
              this.authService.logout();
            }
          }
        ]
      }
    ]
  }
}
