import { Routes } from '@angular/router';
import {NoteListComponent} from './note-list/note-list.component';
import {RegisterComponent} from './auth/register/register.component';
import {LoginComponent} from './auth/login/login.component';
import {authGuard} from './guard/auth-guard';
import {ContactComponent} from './contact/contact.component';
import {ViewNoteComponent} from './view-note/view-note.component';

export const routes: Routes = [
  {
    path: '', component: NoteListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'register', component: RegisterComponent
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: 'contact', component: ContactComponent,
    canActivate: [authGuard]
  },
  {
    path: 'note/:id', component: ViewNoteComponent,
    canActivate: [authGuard]
  }
];
