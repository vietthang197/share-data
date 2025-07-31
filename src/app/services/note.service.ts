import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AuthService} from './auth.service';
import {PaginationDto} from '../dto/pagination-dto';
import {NoteDto} from '../dto/note-dto';
import {GenQrShareNoteResponse} from '../dto/gen-qr-share-note-response';
import {BaseResponse} from '../dto/base-response';
import {ListAccountAccessNoteResponse} from '../dto/list-account-access-note-response';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  createNote(request: Partial<{ content: string | null; title: string | null }>) {
    return this.http.post<NoteDto>(environment.API_ENDPOINT +'/api/v1/note', JSON.stringify(request), {
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

  genQrShareNote(noteId?: string | null) {
    return this.http.get<GenQrShareNoteResponse>(environment.API_ENDPOINT +'/api/v1/note/gen-qr/' +  noteId, {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${this.authService.getAccessToken()}`
      }
    });
  }

  deleteNote(noteId: string) {
    return this.http.delete<BaseResponse>(environment.API_ENDPOINT +'/api/v1/note/' +  noteId, {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${this.authService.getAccessToken()}`
      }
    });
  }

  updateNote(request: Partial<{ content: string | null; id: string | null; title: string | null }>) {
    return this.http.put<NoteDto>(environment.API_ENDPOINT +'/api/v1/note/' + request['id'], JSON.stringify(request), {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${this.authService.getAccessToken()}`
      }
    });
  }

  getListAccountAccessNote(noteId?: string | null) {
    return this.http.get<ListAccountAccessNoteResponse>(environment.API_ENDPOINT +'/api/v1/note/access/' +  noteId, {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${this.authService.getAccessToken()}`
      }
    });
  }

  changePermission(email?: string | null, noteId?: string | null, permission?: string | null) {
    return this.http.post<BaseResponse>(environment.API_ENDPOINT +'/api/v1/note/change-permission/' + noteId, JSON.stringify({
      email: email,
      permission: permission,
    }),
      {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `${this.authService.getAccessToken()}`
        }
      }
    )
  }
}
