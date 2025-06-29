import { Routes } from '@angular/router';
import {NoteListComponent} from './note-list/note-list.component';
import {RegisterComponent} from './auth/register/register.component';
import {LoginComponent} from './auth/login/login.component';

export const routes: Routes = [
  {
    path: '', component: NoteListComponent
  },
  {
    path: 'register', component: RegisterComponent
  },
  {
    path: 'login', component: LoginComponent
  }
];
