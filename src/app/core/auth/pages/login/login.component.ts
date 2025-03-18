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

    Swal.fire({
      title: 'Iniciando Sesión',
      text: 'Espere por favor...',
      showConfirmButton: false,
      allowOutsideClick: false
    });
    Swal.showLoading();

    const { userName, password } = this.loginForm.value;

    this.authService.login(userName, password).subscribe({
      next: (response: IResult<any>) => {
        console.log('Respuesta del servicio:', response);

        if (response.isSuccess) {
          Swal.fire({
            icon: "success",
            title: "Acceso concedido",
            text: "Accediendo al sistema...",
            timer: 1000,
            showConfirmButton: false
          }).then(() => {
            if (response.value?.isFirstLogin == false) { 
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/change-password']);
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.error || "Usuario o contraseña incorrectos.",
            timer: 3000,
            showConfirmButton: false
          });
        }
      },
      error: (error) => {
        console.error('Error en autenticación:', error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al comunicarse con el servidor.",
          timer: 3000,
          showConfirmButton: false
        });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
