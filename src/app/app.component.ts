import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {Button} from 'primeng/button';
import {Menubar} from 'primeng/menubar';
import {AuthService} from './services/auth.service';
import {MenuService} from './services/menu.service';
import {Menu} from 'primeng/menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menubar, Button, Menu, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'share-data';

  constructor(protected menuService: MenuService, protected authService: AuthService) {
  }

  ngOnInit() {

  }
}
