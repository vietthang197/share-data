import {Component, OnInit} from '@angular/core';
import {InputText} from 'primeng/inputtext';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {NgForOf} from '@angular/common';
import {Dialog} from 'primeng/dialog';
import {Editor, EditorModule} from 'primeng/editor';
import {FormsModule} from '@angular/forms';

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
    FormsModule

  ],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.css'
})
export class NoteListComponent implements OnInit {
  notes!: string[];
  visible = false;
  noteContent: string = '';
  cols!: Column[];

  constructor() {}

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
}
