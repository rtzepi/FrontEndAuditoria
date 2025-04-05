import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  isLoading: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;


  weakPasswords = [
    '1234567', '12345678', '123456789', '1234567890',
    'abcdefg', 'abcdefgh', 'password', 'qwerty',
    '1111111', '0000000', '987654321', '123123123'
  ];

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.changePasswordForm = this.fb.group(
      {
        newPassword: ['', [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(14),
          this.passwordStrengthValidator.bind(this),
          this.weakPasswordValidator.bind(this)
        ]],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }


  caracteresEspeciales = '!@#$%^&*';


  

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const errors: {[key: string]: boolean} = {};
    
    if (!hasLetter) errors['missingLetter'] = true;
    if (!hasNumber) errors['missingNumber'] = true;
    if (!hasSpecialChar) errors['missingSpecialChar'] = true;

    return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
  }


  weakPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    if (this.weakPasswords.includes(value.toLowerCase())) {
      return { weakPassword: 'La contraseña es demasiado común o insegura' };
    }

    return null;
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(field: 'newPassword' | 'confirmPassword') {
    if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) {
      const newPasswordErrors = this.changePasswordForm.get('newPassword')?.errors;
      
      if (newPasswordErrors?.['weakPassword']) {
        Swal.fire({
          icon: 'warning',
          title: 'Contraseña insegura',
          text: 'Por favor, elige una contraseña más segura que no sea fácil de adivinar.',
          timer: 3000,
          showConfirmButton: false
        });
      } else if (newPasswordErrors?.['passwordStrength']) {
        const strengthErrors = newPasswordErrors['passwordStrength'];
        let errorMessage = 'La contraseña debe contener:';
        
        if (strengthErrors['missingLetter']) errorMessage += '\n- Al menos una letra';
        if (strengthErrors['missingNumber']) errorMessage += '\n- Al menos un número';
        if (strengthErrors['missingSpecialChar']) errorMessage += '\n- Al menos un carácter especial (!@#$%^&*)';
        
        Swal.fire({
          icon: 'warning',
          title: 'Contraseña débil',
          text: errorMessage,
          timer: 3000,
          showConfirmButton: false
        });
      } else if (this.changePasswordForm.get('confirmPassword')?.hasError('passwordMismatch')) {
        Swal.fire({
          icon: 'warning',
          title: 'Las contraseñas no coinciden',
          text: 'Por favor, asegúrate de que ambas contraseñas sean iguales.',
          timer: 3000,
          showConfirmButton: false
        });
      }
      return;
    }

    Swal.fire({
      title: 'Cambiando contraseña',
      text: 'Espere por favor...',
      showConfirmButton: false,
      allowOutsideClick: false
    });
    Swal.showLoading();

    const { newPassword, confirmPassword } = this.changePasswordForm.value;

    this.authService.changePassword(newPassword, confirmPassword).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.isSuccess) {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña cambiada',
            text: 'Tu contraseña ha sido cambiada correctamente.',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/home']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.error || 'No se pudo cambiar la contraseña.',
            timer: 3000,
            showConfirmButton: false
          });
        }
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un problema al cambiar la contraseña. Inténtalo de nuevo.',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }
}







// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { AuthService } from '../../../services/auth.service';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-change-password',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './change-password.component.html',
//   styleUrls: ['./change-password.component.scss'],
// })
// export class ChangePasswordComponent {
//   changePasswordForm: FormGroup;
//   isLoading: boolean = false;

//   constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
//     this.changePasswordForm = this.fb.group(
//       {
//         newPassword: ['', [Validators.required, Validators.minLength(6)]],
//         confirmPassword: ['', [Validators.required]]
//       },
//       {
//         validators: this.passwordMatchValidator
//       }
//     );
//   }

//   passwordMatchValidator(group: FormGroup) {
//     const password = group.get('newPassword')?.value;
//     const confirmPassword = group.get('confirmPassword')?.value;
    
//     if (password !== confirmPassword) {
//       group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
//       return { passwordMismatch: true };
//     }
//     return null;
//   }

//   onSubmit() {
//     if (this.changePasswordForm.invalid) {
//       if (this.changePasswordForm.get('confirmPassword')?.hasError('passwordMismatch')) {
//         Swal.fire({
//           icon: 'warning',
//           title: 'Las contraseñas no coinciden',
//           text: 'Por favor, asegúrate de que ambas contraseñas sean iguales.',
//           timer: 3000,
//           showConfirmButton: false
//         });
//       }
//       return;
//     }

//     Swal.fire({
//       title: 'Cambiando contraseña',
//       text: 'Espere por favor...',
//       showConfirmButton: false,
//       allowOutsideClick: false
//     });
//     Swal.showLoading();

//     const { newPassword, confirmPassword } = this.changePasswordForm.value;

//     this.authService.changePassword(newPassword, confirmPassword).subscribe({
//       next: (response) => {
//         this.isLoading = false;

//         if (response.isSuccess) {
//           Swal.fire({
//             icon: 'success',
//             title: 'Contraseña cambiada',
//             text: 'Tu contraseña ha sido cambiada correctamente.',
//             timer: 2000,
//             showConfirmButton: false
//           }).then(() => {
//             this.router.navigate(['/home']);
//           });
//         } else {
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: response.error || 'No se pudo cambiar la contraseña.',
//             timer: 3000,
//             showConfirmButton: false
//           });
//         }
//       },
//       error: () => {
//         this.isLoading = false;
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'Ocurrió un problema al cambiar la contraseña. Inténtalo de nuevo.',
//           timer: 3000,
//           showConfirmButton: false
//         });
//       }
//     });
//   }
// }