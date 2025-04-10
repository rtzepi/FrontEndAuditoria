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
          console.log(this.profileData);
        }
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.showError('Error al cargar perfil');
      }
    });
  }

  getProfileImage(): string {

    return this.profileData.picture?this.profileData.picture: '';
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