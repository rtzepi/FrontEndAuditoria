import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  changePasswordForm: FormGroup;
  isLoading: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  token: string = '';

  weakPasswords = [
    '1234567', '12345678', '123456789', '1234567890',
    'abcdefg', 'abcdefgh', 'password', 'qwerty',
    '1111111', '0000000', '987654321', '123123123'
  ];

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private userService: UserService,
    private route: ActivatedRoute
  ) {
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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      
      if (!this.token) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Token no válido o faltante.',
          timer: 3000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
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

    if (!this.token) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Token no válido o faltante.',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    this.isLoading = true;

    const { newPassword } = this.changePasswordForm.value;

    this.userService.resetPassword({ token: this.token, newPassword }).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response.isSuccess) {
          Swal.fire({
            icon: 'success',
            title: '¡Contraseña restablecida!',
            text: 'Tu contraseña ha sido restablecida correctamente.',
            timer: 3000,
            showConfirmButton: false
          }).then(() => {
            this.redirectToLogin();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.error || 'No se pudo restablecer la contraseña.',
            timer: 3000,
            showConfirmButton: false
          });
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.error || 'Ocurrió un problema al restablecer la contraseña. Inténtalo de nuevo.',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}





// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { Router, ActivatedRoute } from '@angular/router';
// import { UserService } from '../../../../core/services/user.service';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-reset-password',
//   standalone: true,
//   imports: [],
//   templateUrl: './reset-password.component.html',
//   styleUrl: './reset-password.component.scss'
// })
// export class ResetPasswordComponent {
//   changePasswordForm: FormGroup;
//     isLoading: boolean = false;
//     showNewPassword: boolean = false;
//     showConfirmPassword: boolean = false;
//     token: string = '';
//     showMFAModal: boolean = false;
//     mfaData: any = null;
  
//     weakPasswords = [
//       '1234567', '12345678', '123456789', '1234567890',
//       'abcdefg', 'abcdefgh', 'password', 'qwerty',
//       '1111111', '0000000', '987654321', '123123123'
//     ];
  
//     constructor(
//       private fb: FormBuilder, 
//       private router: Router, 
//       private userService: UserService,
//       private route: ActivatedRoute
//     ) {
//       this.changePasswordForm = this.fb.group(
//         {
//           newPassword: ['', [
//             Validators.required,
//             Validators.minLength(7),
//             Validators.maxLength(14),
//             this.passwordStrengthValidator.bind(this),
//             this.weakPasswordValidator.bind(this)
//           ]],
//           confirmPassword: ['', [Validators.required]]
//         },
//         {
//           validators: this.passwordMatchValidator
//         }
//       );
//     }
  
//     ngOnInit() {
//       this.route.queryParams.subscribe(params => {
//         this.token = params['token'] || '';
        
//         if (!this.token) {
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: 'Token no válido o faltante.',
//             timer: 3000,
//             showConfirmButton: false
//           }).then(() => {
//             this.router.navigate(['/login']);
//           });
//         }
//       });
//     }
  
//     caracteresEspeciales = '!@#$%^&*';
  
//     passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
//       const value = control.value;
//       if (!value) return null;
  
//       const hasNumber = /[0-9]/.test(value);
//       const hasLetter = /[a-zA-Z]/.test(value);
//       const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  
//       const errors: {[key: string]: boolean} = {};
      
//       if (!hasLetter) errors['missingLetter'] = true;
//       if (!hasNumber) errors['missingNumber'] = true;
//       if (!hasSpecialChar) errors['missingSpecialChar'] = true;
  
//       return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
//     }
  
//     weakPasswordValidator(control: AbstractControl): ValidationErrors | null {
//       const value = control.value;
//       if (!value) return null;
  
//       if (this.weakPasswords.includes(value.toLowerCase())) {
//         return { weakPassword: 'La contraseña es demasiado común o insegura' };
//       }
  
//       return null;
//     }
  
//     passwordMatchValidator(group: FormGroup) {
//       const password = group.get('newPassword')?.value;
//       const confirmPassword = group.get('confirmPassword')?.value;
      
//       if (password !== confirmPassword) {
//         group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
//         return { passwordMismatch: true };
//       }
//       return null;
//     }
  
//     togglePasswordVisibility(field: 'newPassword' | 'confirmPassword') {
//       if (field === 'newPassword') {
//         this.showNewPassword = !this.showNewPassword;
//       } else {
//         this.showConfirmPassword = !this.showConfirmPassword;
//       }
//     }
  
//     onSubmit() {
//       if (this.changePasswordForm.invalid) {
//         const newPasswordErrors = this.changePasswordForm.get('newPassword')?.errors;
        
//         if (newPasswordErrors?.['weakPassword']) {
//           Swal.fire({
//             icon: 'warning',
//             title: 'Contraseña insegura',
//             text: 'Por favor, elige una contraseña más segura que no sea fácil de adivinar.',
//             timer: 3000,
//             showConfirmButton: false
//           });
//         } else if (newPasswordErrors?.['passwordStrength']) {
//           const strengthErrors = newPasswordErrors['passwordStrength'];
//           let errorMessage = 'La contraseña debe contener:';
          
//           if (strengthErrors['missingLetter']) errorMessage += '\n- Al menos una letra';
//           if (strengthErrors['missingNumber']) errorMessage += '\n- Al menos un número';
//           if (strengthErrors['missingSpecialChar']) errorMessage += '\n- Al menos un carácter especial (!@#$%^&*)';
          
//           Swal.fire({
//             icon: 'warning',
//             title: 'Contraseña débil',
//             text: errorMessage,
//             timer: 3000,
//             showConfirmButton: false
//           });
//         } else if (this.changePasswordForm.get('confirmPassword')?.hasError('passwordMismatch')) {
//           Swal.fire({
//             icon: 'warning',
//             title: 'Las contraseñas no coinciden',
//             text: 'Por favor, asegúrate de que ambas contraseñas sean iguales.',
//             timer: 3000,
//             showConfirmButton: false
//           });
//         }
//         return;
//       }
  
//       if (!this.token) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'Token no válido o faltante.',
//           timer: 3000,
//           showConfirmButton: false
//         });
//         return;
//       }
  
//       this.isLoading = true;
  
//       const { newPassword } = this.changePasswordForm.value;
  
//       this.userService.setPassword({ token: this.token, newPassword }).subscribe({
//         next: (response: any) => {
//           this.isLoading = false;
  
//           if (response.isSuccess) {
//             // Mostrar modal MFA en lugar de redirigir inmediatamente
//             this.mfaData = response.value;
//             this.showMFAModal = true;
//           } else {
//             Swal.fire({
//               icon: 'error',
//               title: 'Error',
//               text: response.error || 'No se pudo establecer la contraseña.',
//               timer: 3000,
//               showConfirmButton: false
//             });
//           }
//         },
//         error: (error: any) => {
//           this.isLoading = false;
//           console.log(error)
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: error.error?.error || 'Ocurrió un problema al establecer la contraseña. Inténtalo de nuevo.',
//             timer: 3000,
//             showConfirmButton: false
//           });
//         }
//       });
//     }
  
//     redirectToLogin() {
//       this.showMFAModal = false;
//       this.router.navigate(['/login']);
//     }
  
//     copyToClipboard(text: string) {
//       navigator.clipboard.writeText(text).then(() => {
//         Swal.fire({
//           icon: 'success',
//           title: 'Copiado',
//           text: 'Código secreto copiado al portapapeles',
//           timer: 2000,
//           showConfirmButton: false
//         });
//       });
//     }

// }
