import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  createNote(request: string) {
    return this.http.post(environment.API_ENDPOINT +'/api/v1/note', request, {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${this.authService.getAccessToken()}`
      }
    });
  }
}
