import {Component} from '@angular/core';
import {InputMask} from 'primeng/inputmask';
import {MessageService} from 'primeng/api';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Toast} from 'primeng/toast';

@Component({
  selector: 'app-contact',
  imports: [
    InputMask,
    ReactiveFormsModule,
    Toast
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  providers: [MessageService]
})
export class ContactComponent {

  contactForm = new FormGroup({});

  constructor(private messageService: MessageService) {
  }

  submitContact($event: Event) {
    this.messageService.add({severity: 'success', summary: 'Info', detail: 'Submit contact success', life: 3000})
  }

}
