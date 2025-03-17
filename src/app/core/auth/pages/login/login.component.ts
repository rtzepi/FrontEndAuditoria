import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { IResult } from '../../../../shared/models/IResult';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  formSubmitted: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.formSubmitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { userName, password } = this.loginForm.value;

    this.authService.login(userName, password).subscribe({
      next: (response: IResult<any>) => {
        console.log('Respuesta del servicio:', response);

        if (response.isSuccess) {
          console.log(response.value?.isFirstLogin)
          if (response.value?.isFirstLogin == false) { 
            this.router.navigate(['/home']) 
          }
          else{
            this.router.navigate(['/change-password']) 
          }
        } else {
          this.errorMessage = response.error || 'Error en autenticación.';
        }
      },
      error: (error) => {
        console.error('Error en autenticación:', error);
        console.log(error)
        this.errorMessage = error.message || 'Error al comunicarse con el servidor.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}