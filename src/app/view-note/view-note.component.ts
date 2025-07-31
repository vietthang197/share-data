import {Component, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {InputText} from 'primeng/inputtext';
import {Card} from 'primeng/card';
import {ActivatedRoute} from '@angular/router';
import {NoteDto} from '../dto/note-dto';
import {NoteService} from '../services/note.service';
import {DomSanitizer} from '@angular/platform-browser';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {DatePipe} from '@angular/common';
import {Message} from 'primeng/message';
import {ProgressBar} from 'primeng/progressbar';
import {Skeleton} from 'primeng/skeleton';

@Component({
  selector: 'app-view-note',
  imports: [
    FormsModule,
    Card,
    Toast,
    DatePipe,
    Message,
    ProgressBar,
    Skeleton
  ],
  templateUrl: './view-note.component.html',
  styleUrl: './view-note.component.css',
  providers: [MessageService]
})
export class ViewNoteComponent implements OnInit {

  note?: NoteDto;
  errorMessage?: string;
  loadingData: boolean = false;

  constructor(private activatedRoute: ActivatedRoute, private noteService: NoteService,  protected sanitizer: DomSanitizer, private messageService: MessageService) {
  }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.loadingData = true;
    if (id) {
      this.noteService.getContent(id).subscribe({
        next: data => {
          this.loadingData = false;
          this.note = data;
        },
        error: error => {
          this.loadingData = false;
          if (error.status === 403) {
            this.errorMessage = 'You are not authorized to view note.';
          }
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ops some thing went wrong, try again later', life: 3000 })
        },
        complete: () => {
          this.loadingData = false;
        }
      })
    }
  }

}
