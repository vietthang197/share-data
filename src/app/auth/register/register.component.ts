import {Component, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {InputText} from "primeng/inputtext";
import {AuthService} from '../../services/auth.service';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Message} from 'primeng/message';
import {catchError, of, switchMap, tap} from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-register',
  imports: [
    Button,
    InputText,
    ReactiveFormsModule,
    Message,
    Toast,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  providers: [MessageService]
})
export class RegisterComponent implements OnInit {

  signupErrorMessage: string | null = null;

  protected signupForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
    password_confirmation: new FormControl(null, [Validators.required]),
  });

  constructor(public authService: AuthService, private router: Router, private messageService: MessageService) {
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  doSignup($event: Event) {
    this.authService.signup(this.signupForm.value).pipe(
      switchMap(signUpResponse => {
        if (signUpResponse && (signUpResponse.status == 201 || signUpResponse.status == 200)) {
          return this.authService.login({
            email: this.signupForm.value['email'],
            password: this.signupForm.value['password']
          }).pipe(catchError(loginError => {
            console.log(loginError);
            return of(null);
          }))
        } else {
           if (signUpResponse) {
             throw new Error(signUpResponse?.message);
           } else {
             throw new Error("Ops, Something went wrong, please try again!")
           }
        }
      }),
      tap(loginResponse => {
        if (loginResponse && loginResponse.status === 200) {
          this.router.navigate(['/']);
        }
        this.messageService.add({ severity: 'success', summary: 'Info', detail: 'Signup successfully', life: 3000 })
      }),
      catchError(err => {
        this.signupErrorMessage = err.message;
        return of(null);
      })
    ).subscribe();
  }
}
