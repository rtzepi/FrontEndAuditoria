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
  requiresMFA: boolean = false;
  userName: string = '';
  password: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      mfaCode: ['']
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

    const { userName, password, mfaCode } = this.loginForm.value;

    this.authService.login(userName, password, mfaCode).subscribe({
      next: (response: IResult<any>) => {
        console.log('Respuesta del servicio:', response);

        if (response.isSuccess) {
          // Verificar si requiere MFA
          if (response.value?.requiresMFA) {
            this.requiresMFA = true;
            this.userName = userName;
            this.password = password;
            Swal.close();
            Swal.fire({
              icon: "info",
              title: "Código MFA Requerido",
              text: "Por favor ingresa el código de verificación de dos factores.",
              timer: 3000,
              showConfirmButton: false
            });
          } else if (response.value?.isFirstLogin) {
            Swal.fire({
              icon: "success",
              title: "Acceso concedido",
              text: "Debe cambiar su contraseña para continuar.",
              timer: 1000,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/change-password']);
            });
          } else {
            Swal.fire({
              icon: "success",
              title: "Acceso concedido",
              text: "Accediendo al sistema...",
              timer: 1000,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/home']);
            });
          }
        } else {
          // Verificar si el error es por requerir MFA
          if (response.error && response.error.includes('MFA')) {
            this.requiresMFA = true;
            this.userName = userName;
            this.password = password;
            Swal.close();
            Swal.fire({
              icon: "info",
              title: "Código MFA Requerido",
              text: response.error,
              timer: 3000,
              showConfirmButton: false
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

  navigateToRecovery(): void {
    this.router.navigate(['/forget-password']);
  }

  resendMFA() {
    // Aquí puedes implementar la lógica para reenviar el código MFA si es necesario
    Swal.fire({
      icon: "info",
      title: "Código MFA",
      text: "Por favor revisa tu aplicación de autenticación para obtener el código.",
      timer: 2000,
      showConfirmButton: false
    });
  }
}



// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { AuthService } from '../../../services/auth.service';
// import Swal from 'sweetalert2';
// import { IResult } from '../../../../shared/models/IResult';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss'],
//   providers: [AuthService]
// })
// export class LoginComponent {
//   loginForm: FormGroup;
//   formSubmitted: boolean = false;
//   isLoading: boolean = false;

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router
//   ) {
//     this.loginForm = this.fb.group({
//       userName: ['', [Validators.required]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//     });
//   }

//   onSubmit() {
//     this.formSubmitted = true;

//     if (this.loginForm.invalid) {
//       return;
//     }

//     Swal.fire({
//       title: 'Iniciando Sesión',
//       text: 'Espere por favor...',
//       showConfirmButton: false,
//       allowOutsideClick: false
//     });
//     Swal.showLoading();

//     const { userName, password } = this.loginForm.value;

//     this.authService.login(userName, password).subscribe({
//       next: (response: IResult<any>) => {
//         console.log('Respuesta del servicio:', response);

//         if (response.isSuccess) {
//           // Verificar si requiere MFA
//           if (response.value?.requiresMFA) {
//             Swal.close();
//             // Redirigir a verificación MFA, pasando el userId
//             this.router.navigate(['/auth/mfa-verification'], { 
//               state: { userId: response.value.userId } 
//             });
//           } else if (response.value?.isFirstLogin) {
//             Swal.fire({
//               icon: "success",
//               title: "Acceso concedido",
//               text: "Debe cambiar su contraseña para continuar.",
//               timer: 1000,
//               showConfirmButton: false
//             }).then(() => {
//               this.router.navigate(['/change-password']);
//             });
//           } else {
//             Swal.fire({
//               icon: "success",
//               title: "Acceso concedido",
//               text: "Accediendo al sistema...",
//               timer: 1000,
//               showConfirmButton: false
//             }).then(() => {
//               this.router.navigate(['/home']);
//             });
//           }
//         } else {
//           Swal.fire({
//             icon: "error",
//             title: "Error",
//             text: response.error || "Usuario o contraseña incorrectos.",
//             timer: 3000,
//             showConfirmButton: false
//           });
//         }
//       },
//       error: (error) => {
//         console.error('Error en autenticación:', error);
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: "Error al comunicarse con el servidor.",
//           timer: 3000,
//           showConfirmButton: false
//         });
//       },
//       complete: () => {
//         this.isLoading = false;
//       },
//     });
//   }

// navigateToRecovery(): void {
//   this.router.navigate(['/password-recovery']); // Debe coincidir con la ruta definida
// }
// }