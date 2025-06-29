import {Component, OnInit} from '@angular/core';
import {InputText} from 'primeng/inputtext';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {NgForOf} from '@angular/common';
import {Dialog} from 'primeng/dialog';
import {Editor, EditorModule} from 'primeng/editor';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NoteService} from '../services/note.service';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';

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
    Toast
  ],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.css',
  providers: [MessageService]
})
export class NoteListComponent implements OnInit {
  notes!: string[];
  visible = false;
  cols!: Column[];


  noteForm = new FormGroup({
    title: new FormControl<string|null>(null),
    content: new FormControl<string|null>(null)
  })

  constructor(private noteService: NoteService, private messageService: MessageService) { }

  ngOnInit() {

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'createdDt', header: 'Date' },
      { field: 'name', header: 'Name' },
      { field: 'content', header: 'Content' },
      { field: 'action', header: 'Action' }
    ];
  }

  showDialogCreateNote() {
    this.visible = true;
  }

  submitNote(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.noteService.createNote(JSON.stringify(this.noteForm.value)).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Info', detail: 'Create note successfully', life: 3000 })
        this.visible = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ops some thing went wrong, try again later', life: 3000 })
      },
      complete: () => {
      },
    });
    console.log(JSON.stringify(this.noteForm.value));
  }
}
