import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AuthService} from './auth.service';
import {PaginationDto} from '../dto/pagination-dto';
import {NoteDto} from '../dto/note-dto';
import {GenQrShareNoteResponse} from '../dto/gen-qr-share-note-response';
import {BaseResponse} from '../dto/base-response';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  createNote(request: string) {
    return this.http.post<NoteDto>(environment.API_ENDPOINT +'/api/v1/note', request, {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${this.authService.getAccessToken()}`
      }
    });
  }

  getNotes(first: number, rows: number, query: string) {
    return this.http.get<PaginationDto<NoteDto>>(environment.API_ENDPOINT +'/api/v1/note', {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${this.authService.getAccessToken()}`
      },
      params: {
        size: rows,
        page: first,
        q: query
      }
    });
  }

  getContent(noteId: string | undefined) {
    return this.http.get<NoteDto>(environment.API_ENDPOINT +'/api/v1/note/' +  noteId, {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${this.authService.getAccessToken()}`
      }
    });
  }

  genQrShareNote(noteId: string) {
    return this.http.get<GenQrShareNoteResponse>(environment.API_ENDPOINT +'/api/v1/note/gen-qr/' +  noteId, {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${this.authService.getAccessToken()}`
      }
    });
  }
}
