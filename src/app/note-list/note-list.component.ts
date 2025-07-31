import {Component, OnInit, signal} from '@angular/core';
import {InputText} from 'primeng/inputtext';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {Button, ButtonDirective, ButtonIcon, ButtonLabel} from 'primeng/button';
import {TableModule, TablePageEvent} from 'primeng/table';
import {CommonModule} from '@angular/common';
import {Dialog} from 'primeng/dialog';
import {Editor,} from 'primeng/editor';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NoteService} from '../services/note.service';
import {Toast} from 'primeng/toast';
import {ConfirmationService, MessageService} from 'primeng/api';
import {NoteDto} from '../dto/note-dto';
import {Tooltip} from 'primeng/tooltip';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Fieldset} from 'primeng/fieldset';
import {Image} from 'primeng/image';
import {catchError, of, switchMap, tap} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {ConfirmPopup, ConfirmPopupModule} from 'primeng/confirmpopup';
import {ProgressBar} from 'primeng/progressbar';
import {Skeleton} from 'primeng/skeleton';
import {Select} from 'primeng/select';
import {UserAccountPermission} from '../dto/user-account-permission';

interface Column {
  field: string;
  header: string;
}

interface Scope {
  name: string;
  code: string;
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
    ConfirmPopupModule,
    ProgressBar,
    Skeleton,
    Select
  ],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.css',
  providers: [MessageService, ConfirmationService]
})
export class NoteListComponent implements OnInit {
  notes: NoteDto[] = [];
  visiblePopupCreator = false;
  visiblePopupEditor = false;
  visibleViewer = false;
  visibleShareNote = false;
  colsTable!: Column[];
  first = 0;
  rows = 10;
  totalRecords = 0;
  searchNoteQuery: string = '';
  loadingEditorData: boolean = false;

  currentNoteView?: NoteDto;
  currentNoteIdEditor?: string | null;
  loadingSharedData: boolean = false;
  currentShareNoteId?: string | null;

  qrNote = signal<string>('');
  qrLink: string = '';

  noteFormCreator = new FormGroup({
    title: new FormControl<string | null>(null),
    content: new FormControl<string | null>(null)
  })
  noteFormEditor = new FormGroup({
    id: new FormControl<string | null>(null),
    title: new FormControl<string | null>(null),
    content: new FormControl<string | null>(null)
  })

  formInvite = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    permission: new FormControl<Scope | null>(null, [Validators.required])
  })

  scopes: Scope[] = [
    {name: 'View permission', code: 'view'},
    {name: 'Edit permission', code: 'edit'}
  ];

  loadingUserAccessNote = false;
  listUserAccessNote: UserAccountPermission[] = []

  constructor(private noteService: NoteService, private messageService: MessageService, protected sanitizer: DomSanitizer,
              protected authService: AuthService, private router: Router, private confirmationService: ConfirmationService) {
  }

  ngOnInit() {

    this.colsTable = [
      {field: 'stt', header: 'Stt'},
      {field: 'id', header: 'ID'},
      {field: 'createdAt', header: 'Created at'},
      {field: 'title', header: 'Title'},
      {field: 'content', header: 'Content'},
      {field: 'action', header: 'Action'}
    ];

    if (this.authService.isAuthenticated()) {
      this.getNotes(this.first, this.rows, this.searchNoteQuery);
    }
  }

  showDialogCreateNote() {
    this.noteFormCreator.reset();
    if (this.authService.isAuthenticated()) {
      this.visiblePopupCreator = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  submitNote(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.noteService.createNote(this.noteFormCreator.value).pipe(
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
        this.messageService.add({severity: 'success', summary: 'Info', detail: 'Create note successfully', life: 3000})
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ops some thing went wrong, try again later',
          life: 3000
        })
      },
      complete: () => {
        this.noteFormCreator.reset();
        this.visiblePopupCreator = false;
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ops some thing went wrong, try again later',
          life: 3000
        })
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
        this.currentNoteView = response;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ops some thing went wrong, try again later',
          life: 3000
        })
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
    navigator.clipboard.writeText(qrLink).then(r => {
    });
    this.messageService.add({severity: 'success', summary: 'Info', detail: 'Copy successful', life: 3000})
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
        this.noteService.deleteNote(noteId).subscribe({
          next: (response) => {
            if (response && response.status == 200) {
              this.messageService.add({severity: 'success', summary: 'Info', detail: 'Deleted note', life: 3000});
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Ops some thing went wrong, try again later',
                life: 3000
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Ops some thing went wrong, try again later',
              life: 3000
            })
          },
          complete: () => {
            this.getNotes(this.first, this.rows, this.searchNoteQuery);
          }
        });
      },
      reject: () => {

      }
    });
  }

  editNote($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.noteService.updateNote(this.noteFormEditor.value).pipe(
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
        this.messageService.add({severity: 'success', summary: 'Info', detail: 'Edit note successfully', life: 3000})
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ops some thing went wrong, try again later',
          life: 3000
        })
      },
      complete: () => {
        this.noteFormEditor.reset();
        this.visiblePopupEditor = false;
      },
    });
  }

  openEditNote($event: Event, noteId: string) {
    this.noteFormEditor.reset();
    this.loadingEditorData = true;
    this.visiblePopupEditor = true;
    this.currentNoteIdEditor = noteId;
  }

  onShowEditNoteDialog() {
    if (this.currentNoteIdEditor) {
      this.noteService.getContent(this.currentNoteIdEditor).subscribe({
        next: (response) => {
          this.loadingEditorData = false;
          this.noteFormEditor.reset();
          this.noteFormEditor.setValue({
            id: response.id,
            title: response.title,
            content: response.content
          })
        },
        error: (error) => {
          this.visiblePopupEditor = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ops some thing went wrong, try again later',
            life: 3000
          })
        },
        complete: () => {
          this.loadingEditorData = false;
          this.currentNoteIdEditor = null;
        }
      })
    }
  }

  openShareDialog(noteId: string) {
    this.loadingSharedData = true;
    this.currentShareNoteId = noteId;
    this.visibleShareNote = true;

    console.log(this.currentShareNoteId)
  }

  onShowQrShareDialog() {
    this.noteService.genQrShareNote(this.currentShareNoteId).subscribe({
      next: (response) => {
        this.loadingSharedData = false;
        this.qrNote.set('data:image/jpeg;base64,' + response.qr);
        this.qrLink = response.link;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ops some thing went wrong, try again later',
          life: 3000
        })
      },
      complete: () => {
        this.loadingSharedData = false;
      }
    })
    this.loadingUserAccessNote = true;
    this.noteService.getListAccountAccessNote(this.currentShareNoteId).subscribe({
      next: (response) => {
        this.loadingUserAccessNote = false;
        this.listUserAccessNote = response.accountList;
      },
      error: (error) => {
        this.loadingUserAccessNote = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ops some thing went wrong, try again later',
          life: 3000
        })
      },
      complete: () => {
        this.loadingUserAccessNote = false;
      }
    })
  }

  onHideShareDialog() {

  }

  changeUserPermission($event: Event, email: string) {
    var permission = ($event.target as HTMLSelectElement).value;

    this.noteService.changePermission(email, this.currentShareNoteId, permission).pipe(
      switchMap(value => {
        this.loadingUserAccessNote = true;
        return this.noteService.getListAccountAccessNote(this.currentShareNoteId);
      })
    ).subscribe({
      next: (response) => {
        this.loadingUserAccessNote = false;
        this.listUserAccessNote = response.accountList;
      },
      error: (error) => {
        this.loadingUserAccessNote = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ops some thing went wrong, try again later',
          life: 3000
        })
      },
      complete: () => {
        this.loadingUserAccessNote = false;
      }
    })
  }

  submitInvite($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();


    this.noteService.changePermission(this.formInvite.value['email'], this.currentShareNoteId, this.formInvite.value['permission']?.code).pipe(
      switchMap(value => {
        this.loadingUserAccessNote = true;
        return this.noteService.getListAccountAccessNote(this.currentShareNoteId);
      })
    ).subscribe({
      next: (response) => {
        this.loadingUserAccessNote = false;
        this.listUserAccessNote = response.accountList;
        this.formInvite.reset()
      },
      error: (error) => {
        this.loadingUserAccessNote = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ops some thing went wrong, try again later',
          life: 3000
        })
        this.formInvite.reset()
      },
      complete: () => {
        this.loadingUserAccessNote = false;
        this.formInvite.reset()
      }
    })

  }
}
