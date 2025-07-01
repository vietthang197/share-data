import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {Button} from 'primeng/button';
import {Menubar} from 'primeng/menubar';
import {MenuItem} from 'primeng/api';
import {Toast} from 'primeng/toast';
import {AuthService} from './services/auth.service';
import {MenuService} from './services/menu.service';
import {Avatar} from 'primeng/avatar';
import {InputText} from 'primeng/inputtext';
import {Menu} from 'primeng/menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menubar, Button, Menu],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'share-data';

  constructor(protected menuService: MenuService, protected authService: AuthService, private router: Router) {
  }

  async ngOnInit() {
    this.menuService.initMenu();
  }

  doLogin() {
    this.router.navigate(['login']);
  }
}
