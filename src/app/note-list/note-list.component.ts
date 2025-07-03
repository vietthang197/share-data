import {Component, OnInit, signal} from '@angular/core';
import {InputText} from 'primeng/inputtext';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {Button, ButtonDirective, ButtonIcon, ButtonLabel} from 'primeng/button';
import {TableModule, TablePageEvent} from 'primeng/table';
import {CommonModule, NgForOf} from '@angular/common';
import {Dialog} from 'primeng/dialog';
import {Editor,} from 'primeng/editor';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NoteService} from '../services/note.service';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {NoteDto} from '../dto/note-dto';
import {Tooltip} from 'primeng/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {Fieldset} from 'primeng/fieldset';
import {Image} from 'primeng/image';
import {Message} from 'primeng/message';
import {catchError, of, switchMap, tap} from 'rxjs';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-note-list',
  imports: [
    InputText,
    InputGroup,
    InputGroupAddon,
    Button,
    TableModule,
    NgForOf,
    Dialog,
    Editor,
    FormsModule,
    ReactiveFormsModule,
    Toast,
    CommonModule,
    Tooltip,
    Fieldset,
    Image,
    ButtonDirective,
    ButtonLabel,
    ButtonIcon
  ],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.css',
  providers: [MessageService]
})
export class NoteListComponent implements OnInit {
  notes: NoteDto[] = [];
  visibleEditor = false;
  visibleViewer = false;
  visibleQr = false;
  colsTable!: Column[];
  first = 0;
  rows = 10;
  totalRecords = 0;

  safeContent: SafeHtml = '';
  currentNote?: NoteDto;
  qrNote?: string;
  qrLink = signal<string>('');

  noteForm = new FormGroup({
    title: new FormControl<string|null>(null),
    content: new FormControl<string|null>(null)
  })

  constructor(private noteService: NoteService, private messageService: MessageService, private sanitizer: DomSanitizer) { }

  ngOnInit() {

    this.colsTable = [
      { field: 'id', header: 'ID' },
      { field: 'createdAt', header: 'Created at' },
      { field: 'title', header: 'Title' },
      { field: 'content', header: 'Content' },
      { field: 'action', header: 'Action' }
    ];

    this.getNotes(this.first, this.rows);
  }

  showDialogCreateNote() {
    this.visibleEditor = true;
  }

  submitNote(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.noteService.createNote(JSON.stringify(this.noteForm.value)).pipe(
      switchMap(value => {
        return this.noteService.getNotes(this.first, this.rows).pipe(catchError(getNoteError => {
          return of(null);
        }));
      }),
      tap(pagingResponse => {
        if (pagingResponse) {
          this.notes = pagingResponse.content;
          this.totalRecords = pagingResponse.page.totalElements;
        }
      })
    ).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Info', detail: 'Create note successfully', life: 3000 })
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ops some thing went wrong, try again later', life: 3000 })
      },
      complete: () => {
        this.noteForm.reset();
        this.visibleEditor = false;
      },
    });
  }

  getNotes(first: number, rows: number) {
    this.noteService.getNotes(this.first, this.rows).subscribe({
      next: (response) => {
        this.notes = response.content;
        this.totalRecords = response.page.totalElements;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ops some thing went wrong, try again later', life: 3000 })
      },
      complete: () => {

      }
    })
  }
  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
    this.getNotes(this.first, this.rows);
  }

  pageChange(event: TablePageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.getNotes(this.first, this.rows);
  }

  isLastPage(): boolean {
    return this.notes ? this.first + this.rows >= this.notes.length : true;
  }

  isFirstPage(): boolean {
    return this.notes ? this.first === 0 : true;
  }

  viewNoteContent(noteId: string) {
    this.noteService.getContent(noteId).subscribe({
      next: (response) => {
        this.visibleViewer = true
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(response.content);
        this.currentNote = response;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ops some thing went wrong, try again later', life: 3000 })
      },
      complete: () => {

      }
    })
  }

  showQr(noteId: string) {
    this.noteService.genQrShareNote(noteId).subscribe({
      next: (response) => {
        this.visibleQr = true;
        this.qrNote = 'data:image/jpeg;base64,' + response.qr;
        this.qrLink.set(response.link);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ops some thing went wrong, try again later', life: 3000 })
      },
      complete: () => {

      }
    })
  }
}
