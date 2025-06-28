import { Injectable } from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NoteServiceService {

  constructor(private http: HttpClient) { }

  createNote(request: string) {
    return this.http.post('http://localhost:8080/api/v1/note', request, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
