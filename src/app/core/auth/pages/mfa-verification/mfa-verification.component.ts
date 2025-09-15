import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mfa-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mfa-verification.component.html',
  styleUrls: ['./mfa-verification.component.scss']
})
export class MFAVerificationComponent implements OnInit {
  mfaForm: FormGroup;
  userId: number | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.mfaForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    // Obtener el userId del estado de la navegación
    const navigation = this.router.getCurrentNavigation();
    this.userId = navigation?.extras?.state?.['userId'] || null;

    if (!this.userId) {
      // Si no hay userId, redirigir al login
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit() {
    if (this.mfaForm.invalid || !this.userId) {
      return;
    }

    this.isLoading = true;
    const code = this.mfaForm.get('code')?.value;

    Swal.fire({
      title: 'Verificando código',
      text: 'Espere por favor...',
      showConfirmButton: false,
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.authService.verifyMFA({ userId: this.userId, code }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.isSuccess) {
          if (response.value?.isFirstLogin) {
            Swal.fire({
              icon: "success",
              title: "Código verificado",
              text: "Debe cambiar su contraseña para continuar.",
              timer: 1000,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/change-password']);
            });
          } else {
            Swal.fire({
              icon: "success",
              title: "Código verificado",
              text: "Accediendo al sistema...",
              timer: 1000,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/home']);
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.error || "Código de verificación incorrecto.",
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
          text: "Error al verificar el código. Inténtelo de nuevo.",
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  resendCode() {
    if (!this.userId) return;
    
    Swal.fire({
      title: 'Reenviando código',
      text: 'Espere por favor...',
      showConfirmButton: false,
      allowOutsideClick: false
    });
    Swal.showLoading();

    // Implementar lógica para reenviar código MFA
    // Esto requerirá un nuevo endpoint en tu backend
    Swal.fire({
      icon: "info",
      title: "Función no disponible",
      text: "La función de reenvío de código no está implementada aún.",
      timer: 3000,
      showConfirmButton: false
    });
  }
}