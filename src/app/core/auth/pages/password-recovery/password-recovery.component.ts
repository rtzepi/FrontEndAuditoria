import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent {
  recoveryForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.recoveryForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.recoveryForm.get('email')?.value;

    Swal.fire({
      title: 'Enviando solicitud',
      text: 'Espere por favor...',
      showConfirmButton: false,
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.authService.requestPasswordReset({ email }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.isSuccess) {
          Swal.fire({
            icon: "success",
            title: "Solicitud enviada",
            text: "Se ha enviado un correo con instrucciones para restablecer su contraseña.",
            timer: 3000,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/auth/login']);
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.error || "Error al enviar la solicitud de recuperación.",
            timer: 3000,
            showConfirmButton: false
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al procesar la solicitud. Inténtelo de nuevo.",
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }
}