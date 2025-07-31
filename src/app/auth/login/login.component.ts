import {Component, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {Divider} from 'primeng/divider';
import {InputText} from 'primeng/inputtext';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Message} from 'primeng/message';
import {AutoFocus} from 'primeng/autofocus';

@Component({
  selector: 'app-login',
  imports: [
    Button,
    InputText,
    ReactiveFormsModule,
    Message,
    RouterLink,
    AutoFocus
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  signinErrorMessage: string | null = null;
  formLogin = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  doLogin($event: Event) {
    if (this.formLogin.valid) {
      this.authService.login({
        email: this.formLogin.value['email'],
        password: this.formLogin.value['password']
      }).subscribe({
        next: loginResponse => {
          if (loginResponse && loginResponse.status == 200) {
            this.router.navigate(['/']);
          } else {
            this.signinErrorMessage = loginResponse.message;
          }
        },
        error: err => {
          if (err?.error?.message) {
            this.signinErrorMessage = err.error.message;
          } else {
            this.signinErrorMessage = 'Ops something went wrong, try again later';
          }
        },
        complete: () => {

        }
      })
    }
  }
}
