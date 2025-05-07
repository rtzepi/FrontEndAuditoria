import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { IProfileResponse, IProfile } from '../../../shared/models/IProfile';
import { IResult } from '../../../shared/models/IResult';
import { NotificationsService } from '../../services/notifications.service';

interface INotification {
  id: number;
  title: string;
  message: string;
  icon?: string;
  time: Date;
  type?: 'default' | 'warning' | 'success' | 'info';
  data?: any;
}

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
    MatSnackBarModule,
    MatBadgeModule,
    DatePipe
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  menuItems: any = [];
  profileData: any = {};
  defaultAvatar = '/img/CONDOR.jpeg';
  isMenuOpen = signal(true);
  notifications: INotification[] = [];

  constructor(
    private authS: AuthService,
    private profileService: ProfileService,
    private notificationsService: NotificationsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMenus();
    this.loadProfile();
    this.setupNotificationCheck();
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
          this.checkForNotifications();
        }
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.showError('Error al cargar perfil');
      }
    });
  }

  setupNotificationCheck(): void {
    setInterval(() => this.checkForNotifications(), 30000);
  }

  checkForNotifications(): void {
    if (this.profileData?.notifyList) {
      this.notifications = this.notificationsService.transformNotifications(this.profileData.notifyList);
    }
  }

  handleNotificationClick(): void {
    // No hacer nada al hacer clic
  }

  getProfileImage(): string {
    return this.profileData.picture || this.defaultAvatar;
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