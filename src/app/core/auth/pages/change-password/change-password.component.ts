import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { error } from 'console';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  [x: string]: any;
  changePasswordForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.changePasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validator: this.passwordMatchValidator
      }
    );
  }


  passwordMatchValidator(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      return null;
    }
    return null;
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) {
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
  
    const { newPassword, confirmPassword } = this.changePasswordForm.value;
  
  
    this.authService.changePassword(newPassword, confirmPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          Swal.fire('Éxito', 'Contraseña cambiada correctamente.', 'success');
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = response.error || 'Error al cambiar la contraseña.';
          Swal.fire('Error', this.errorMessage, 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cambiar la contraseña. Por favor, inténtalo de nuevo.';
        Swal.fire('Error', this.errorMessage, 'error');
      }
    });
  }
}