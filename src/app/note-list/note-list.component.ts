import {Component, OnInit, signal} from '@angular/core';
import {InputText} from 'primeng/inputtext';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {Button, ButtonDirective, ButtonIcon, ButtonLabel} from 'primeng/button';
import {TableModule, TablePageEvent} from 'primeng/table';
import { CommonModule } from '@angular/common';
import {Dialog} from 'primeng/dialog';
import {Editor,} from 'primeng/editor';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NoteService} from '../services/note.service';
import {Toast} from 'primeng/toast';
import {ConfirmationService, MessageService} from 'primeng/api';
import {NoteDto} from '../dto/note-dto';
import {Tooltip} from 'primeng/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {Fieldset} from 'primeng/fieldset';
import {Image} from 'primeng/image';
import {catchError, of, switchMap, tap} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {ConfirmPopup, ConfirmPopupModule} from 'primeng/confirmpopup';

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
    ButtonIcon,
    ConfirmPopupModule
  ],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.css',
  providers: [MessageService, ConfirmationService]
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
  searchNoteQuery: string = '';

  currentNote?: NoteDto;
  qrNote = signal<string>('');
  qrLink = signal<string>('');

  noteForm = new FormGroup({
    title: new FormControl<string|null>(null),
    content: new FormControl<string|null>(null)
  })

  constructor(private noteService: NoteService, private messageService: MessageService, protected sanitizer: DomSanitizer,
              protected authService: AuthService, private router: Router, private confirmationService: ConfirmationService) { }

  ngOnInit() {

    this.colsTable = [
      { field: 'stt', header: 'Stt' },
      { field: 'id', header: 'ID' },
      { field: 'createdAt', header: 'Created at' },
      { field: 'title', header: 'Title' },
      { field: 'content', header: 'Content' },
      { field: 'action', header: 'Action' }
    ];

    if (this.authService.isAuthenticated()) {
      this.getNotes(this.first, this.rows, this.searchNoteQuery);
    }
  }

  showDialogCreateNote() {
    if (this.authService.isAuthenticated()) {
      this.visibleEditor = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  submitNote(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.noteService.createNote(JSON.stringify(this.noteForm.value)).pipe(
      switchMap(value => {
        return this.noteService.getNotes(this.first, this.rows, this.searchNoteQuery).pipe(catchError(getNoteError => {
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

  getNotes(first: number, rows: number, query: string) {
    this.noteService.getNotes(this.first, this.rows, query).subscribe({
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
    this.getNotes(this.first, this.rows, this.searchNoteQuery);
  }

  pageChange(event: TablePageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.getNotes(this.first, this.rows, this.searchNoteQuery);
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
        this.visibleViewer = true;
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
        this.qrNote.set('data:image/jpeg;base64,' + response.qr);
        this.qrLink.set(response.link);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ops some thing went wrong, try again later', life: 3000 })
      },
      complete: () => {

      }
    })
  }

  searchNote($event: Event) {
    $event.stopPropagation();
    $event.preventDefault();

    this.getNotes(this.first, this.rows, this.searchNoteQuery);
  }

  copyLink(qrLink: string) {
    navigator.clipboard.writeText(qrLink).then(r => {});
    this.messageService.add({ severity: 'success', summary: 'Info', detail: 'Copy successful', life: 3000 })
  }

  openLinkViewContent(noteId: string) {
    this.router.navigate([`/note/${noteId}`]);
  }

  deleteNote(noteId: string, $event: Event) {
    this.confirmationService.confirm({
      target: $event.currentTarget as EventTarget,
      message: 'Do you want to delete this record?',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger'
      },
      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted', life: 3000 });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
      }
    });
  }
}
