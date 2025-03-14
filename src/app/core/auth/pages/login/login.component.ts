import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService] // Proporciona el servicio aquí
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  formSubmitted: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Ahora el servicio está disponible
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
      next: (response) => {
        console.log('Respuesta del servicio:', response);

        if (response.isSuccess) {

          const redirectUrl = response.isFirstLogin ? '/change-password' : '/dashboard';
          this.router.navigate([redirectUrl]).then(success => {
            if (success) {
              console.log(`Redirección exitosa a ${redirectUrl}`);
            } else {
              console.error(`Error al navegar a ${redirectUrl}`);
              this.errorMessage = 'Error al redirigir. Inténtalo de nuevo.';
            }
          });
        } else {
          this.errorMessage = response.message || 'Error en autenticación.';
        }
      },
      error: (error) => {
        console.error('Error en autenticación:', error);
        this.errorMessage = error.message || 'Error al comunicarse con el servidor.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}