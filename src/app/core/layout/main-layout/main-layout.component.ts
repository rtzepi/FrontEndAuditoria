import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { IProfileResponse, IProfile } from '../../../shared/models/IProfile';
import { IResult } from '../../../shared/models/IResult';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  menuItems: any = [];
  profileData: IProfile = {
    firstName: '',
    fatherLastName: '',
    roleName: '',
    picture: ''
  };
  defaultAvatar = '/img/CONDOR.jpeg';
  isMenuOpen = signal(true);

  constructor(
    private authS: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMenus();
    this.loadProfile();
  }

  loadMenus(): void {
    this.authS.getAccessMenus().subscribe({
      next: (response: IResult<any>) => {
        if (response.isSuccess) {
          this.menuItems = response.value.menus;
        }
      },
      error: (error) => {
        console.error('Error cargando menús:', error);
        this.showError('Error al cargar menús');
      }
    });
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (response: IProfileResponse) => {
        if (response.isSuccess && response.value) {
          this.profileData = response.value;
        }
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.showError('Error al cargar perfil');
      }
    });
  }

  getProfileImage(): string {
    if (this.profileData?.picture) {
      return this.profileData.picture.startsWith('data:image') 
        ? this.profileData.picture 
        : `data:image/jpeg;base64,${this.profileData.picture}`;
    }
    return this.defaultAvatar;
  }

  getFullName(): string {
    return `${this.profileData?.firstName || ''} ${this.profileData?.fatherLastName || ''}`.trim() || 'Usuario';
  }

  getRole(): string {
    return this.profileData?.roleName || 'Rol no asignado';
  }

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  goToProfile(): void {
    this.router.navigate(['/security/profile']);
  }

  logout(): void {
    this.authS.logout().subscribe({
      next: () => {
        this.showSuccess('Sesión cerrada correctamente');
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        this.showError('Se produjo un error al cerrar sesión');
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}





// import { Component, inject, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatListModule } from '@angular/material/list';
// import { MatButtonModule } from '@angular/material/button';
// import { MatMenuModule } from '@angular/material/menu';
// import { JwtTokenService } from '../../services/jwt-token.service';
// import { AuthService } from '../../services/auth.service';
// import { IResult } from '../../../shared/models/IResult';
// import { ProfileService } from '../../services/profile.service';
// import { IProfileResponse, IProfile } from '../../../shared/models/IProfile';

// @Component({
//   selector: 'app-main-layout',
//   standalone: true,
//   imports: [
//     RouterOutlet,
//     CommonModule,
//     RouterLink,
//     RouterLinkActive,
//     MatSidenavModule,
//     MatToolbarModule,
//     MatIconModule,
//     MatListModule,
//     MatButtonModule,
//     MatMenuModule
//   ],
//   templateUrl: './main-layout.component.html',
//   styleUrl: './main-layout.component.scss'
// })
// export class MainLayoutComponent implements OnInit {
//   menuItems: any = [];
//   profileData: IProfile = {
//     firstName: '',
//     fatherLastName: '',
//     roleName: '',
//     picture: ''
//   };
//   defaultAvatar = '/img/CONDOR.jpeg';

//   constructor(
//     private profileService: ProfileService,
//     private authS: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loadMenus();
//     this.loadProfile();
//   }

//   loadMenus(): void {
//     this.authS.getAccessMenus().subscribe({
//       next: (response: IResult<any>) => {
//         if (response.isSuccess) {
//           this.menuItems = response.value.menus;
//         } 
//       },
//       error: (error) => {
//         console.error('Error cargando menús:', error);
//       }
//     });
//   }

//   loadProfile(): void {
//     this.profileService.getProfile().subscribe({
//       next: (response: IProfileResponse) => {
//         if (response.isSuccess && response.value) {
//           this.profileData = response.value;
//         }
//       },
//       error: (error) => {
//         console.error('Error cargando perfil:', error);
//       }
//     });
//   }

//   getProfileImage(): string {
//     if (this.profileData?.picture) {
//       return this.profileData.picture.startsWith('data:image') 
//         ? this.profileData.picture 
//         : `data:image/jpeg;base64,${this.profileData.picture}`;
//     }
//     return this.defaultAvatar;
//   }

//   getFullName(): string {
//     return `${this.profileData?.firstName || ''} ${this.profileData?.fatherLastName || ''}`.trim() || 'Usuario';
//   }

//   getRole(): string {
//     return this.profileData?.roleName || 'Rol no asignado';
//   }

//   isMenuOpen = signal(true);
//   jwt = inject(JwtTokenService);

//   toggleMenu() {
//     this.isMenuOpen.set(!this.isMenuOpen());
//   }

//   goToProfile() {
//     this.router.navigate(['/security/profile']);
//   }

//   logout() {
//     console.log("Cerrar sesión");
//     // Lógica de logout
//     this.authS.logout();
//     this.router.navigate(['/auth/login']);
//   }
// }

// import { Component, inject, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatListModule } from '@angular/material/list';
// import { MatButtonModule } from '@angular/material/button';
// import { MatMenuModule } from '@angular/material/menu';
// import { JwtTokenService } from '../../services/jwt-token.service';
// import { AuthService } from '../../services/auth.service';
// import { IResult } from '../../../shared/models/IResult';
// import { ProfileService } from '../../services/profile.service';
// import { IProfileResponse, IProfile } from '../../../shared/models/IProfile';

// @Component({
//   selector: 'app-main-layout',
//   standalone: true,
//   imports: [
//     RouterOutlet,
//     CommonModule,
//     RouterLink,
//     RouterLinkActive,
//     MatSidenavModule,
//     MatToolbarModule,
//     MatIconModule,
//     MatListModule,
//     MatButtonModule,
//     MatMenuModule
//   ],
//   templateUrl: './main-layout.component.html',
//   styleUrl: './main-layout.component.scss'
// })
// export class MainLayoutComponent implements OnInit {
//   menuItems: any = [];
//   isProfileMenuOpen = false;
//   profileData: IProfile = {
//     firstName: '',
//     fatherLastName: '',
//     picture: ''
//   };
//   defaultAvatar = '/img/CONDOR.jpeg';

//   constructor(
//     private profileService: ProfileService,
//     private authS: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loadMenus();
//     this.loadProfile();
//   }

//   loadMenus(): void {
//     this.authS.getAccessMenus().subscribe({
//       next: (response: IResult<any>) => {
//         if (response.isSuccess) {
//           this.menuItems = response.value.menus;
//         } 
//       },
//       error: (error) => {
//         console.error('Error cargando menús:', error);
//       }
//     });
//   }

//   loadProfile(): void {
//     this.profileService.getProfile().subscribe({
//       next: (response: IProfileResponse) => {
//         if (response.isSuccess && response.value) {
//           this.profileData = response.value;
//         }
//       },
//       error: (error) => {
//         console.error('Error cargando perfil:', error);
//       }
//     });
//   }

//   getProfileImage(): string {
//     if (this.profileData?.picture) {
//       return this.profileData.picture.startsWith('data:image') 
//         ? this.profileData.picture 
//         : `data:image/jpeg;base64,${this.profileData.picture}`;
//     }
//     return this.defaultAvatar;
//   }

//   getFullName(): string {
//     return `${this.profileData?.firstName || ''} ${this.profileData?.fatherLastName || ''}`.trim() || 'Usuario';
//   }

//   isMenuOpen = signal(true);
//   jwt = inject(JwtTokenService);

//   toggleMenu() {
//     this.isMenuOpen.set(!this.isMenuOpen());
//   }

//   toggleProfileMenu() {
//     this.isProfileMenuOpen = !this.isProfileMenuOpen;
//   }

//   goToProfile() {
//     this.router.navigate(['/security/profile']);
//   }

//   logout() {
//     console.log("Cerrar sesión");
//     // Lógica de logout
//   }
// }






// import { Component, inject, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatListModule } from '@angular/material/list';
// import { MatButtonModule } from '@angular/material/button';
// import { MatMenuModule } from '@angular/material/menu';
// import { JwtTokenService } from '../../services/jwt-token.service';
// import { AuthService } from '../../services/auth.service';
// import { IResult } from '../../../shared/models/IResult';
// import { ProfileService } from '../../services/profile.service';
// import { IProfileResponse } from '../../../shared/models/IProfile';

// @Component({
//   selector: 'app-main-layout',
//   standalone: true,
//   imports: [
//     RouterOutlet,
//     CommonModule,
//     RouterLink,
//     RouterLinkActive,
//     MatSidenavModule,
//     MatToolbarModule,
//     MatIconModule,
//     MatListModule,
//     MatButtonModule,
//     MatMenuModule
//   ],
//   templateUrl: './main-layout.component.html',
//   styleUrl: './main-layout.component.scss'
// })
// export class MainLayoutComponent implements OnInit {
//   menuItems: any = [];
//   isProfileMenuOpen = false;
//   profileData: any = {
//     username: 'Cargando...',
//     avatarUrl: '/img/CONDOR.jpeg'
//   };

//   constructor(
//     private profileService: ProfileService,
//     private authS: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loadMenus();
//     this.loadProfile();
//   }

//   loadMenus(): void {
//     this.authS.getAccessMenus().subscribe({
//       next: (response: IResult<any>) => {
//         if (response.isSuccess) {
//           this.menuItems = response.value.menus;
//         } 
//       },
//       error: (error) => {
//         console.error('Error cargando menús:', error);
//       }
//     });
//   }

//   loadProfile(): void {
//     this.profileService.getProfile().subscribe({
//       next: (response: IProfileResponse) => {
//         if (response.isSuccess && typeof response.value !== 'string') {
//           this.profileData = {
//             // username: response.value?.username || 'Usuario',
//             // avatarUrl: response.value?.avatarUrl || '/img/CONDOR.jpeg'
//           };
//         }
//       },
//       error: (error) => {
//         console.error('Error cargando perfil:', error);
//       }
//     });
//   }

//   isMenuOpen = signal(true);
//   jwt = inject(JwtTokenService);

//   toggleMenu() {
//     this.isMenuOpen.set(!this.isMenuOpen());
//   }

//   toggleProfileMenu() {
//     this.isProfileMenuOpen = !this.isProfileMenuOpen;
//   }

//   goToProfile() {
//     this.router.navigate(['/security/profile']); // Ruta actualizada según security.routes.ts
//   }

//   logout() {
//     console.log("Cerrar sesión");
//     // Lógica de logout
//   }
// }
















// import { Component, inject, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatListModule } from '@angular/material/list';
// import { MatButtonModule } from '@angular/material/button';
// import { MatMenuModule } from '@angular/material/menu';
// import { JwtTokenService } from '../../services/jwt-token.service';
// import { AuthService } from '../../services/auth.service';
// import { IResult } from '../../../shared/models/IResult';
// import { ProfileService } from '../../services/profile.service';
// import { IProfileResponse } from '../../../shared/models/IProfile';

// @Component({
//   selector: 'app-main-layout',
//   standalone: true,
//   imports: [
//     RouterOutlet,
//     CommonModule,
//     RouterLink,
//     RouterLinkActive,
//     MatSidenavModule,
//     MatToolbarModule,
//     MatIconModule,
//     MatListModule,
//     MatButtonModule,
//     MatMenuModule
//   ],
//   templateUrl: './main-layout.component.html',
//   styleUrl: './main-layout.component.scss'
// })
// export class MainLayoutComponent implements OnInit {
//   menuItems: any = [];
//   isProfileMenuOpen = false;
//   profileData: any = {
//     username: 'Cargando...',
//     avatarUrl: '/img/CONDOR.jpeg'
//   };

//   constructor(
//     private profileService: ProfileService
//   ) {}

//   ngOnInit(): void {
//     this.loadMenus();
//     this.loadProfile();
//   }

//   loadMenus(): void {
//     this.authS.getAccessMenus().subscribe({
//       next: (response: IResult<any>) => {
//         console.log('Respuesta del servicio:', response);
//         if (response.isSuccess) {
//           this.menuItems = response.value.menus;
//           console.log(response.value.menus);
//         } 
//       },
//       error: (error) => {
//         console.error('Error en autenticación:', error);
//       }
//     });
//   }

//   loadProfile(): void {
//     this.profileService.getProfile().subscribe({
//       next: (response: IProfileResponse) => {
//         if (response.isSuccess && typeof response.value !== 'string') {
//           this.profileData = {
//             username: response.value?.username || 'Usuario',
//             avatarUrl: response.value?.avatarUrl || '/img/CONDOR.jpeg'
//           };
//         } else {
//           console.warn('Respuesta inesperada del perfil:', response);
//         }
//       },
//       error: (error) => {
//         console.error('Error al cargar el perfil:', error);
//       }
//     });
//   }

//   isMenuOpen = signal(true);
//   jwt = inject(JwtTokenService);
//   authS = inject(AuthService);

//   toggleMenu() {
//     this.isMenuOpen.set(!this.isMenuOpen());
//   }

//   toggleProfileMenu() {
//     this.isProfileMenuOpen = !this.isProfileMenuOpen;
//   }

//   goToProfile() {
//     console.log("Ir al perfil");
//     // Aquí podrías redirigir al usuario a su perfil
//   }

//   logout() {
//     console.log("Cerrar sesión");
//     // Aquí podrías llamar a un servicio para cerrar sesión
//   }
// }