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
  isRead: boolean;
  type?: 'default' | 'warning' | 'success' | 'info';
  route?: string;
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
  profileData: IProfile = {
    firstName: '',
    fatherLastName: '',
    roleName: '',
    picture: ''
  };
  defaultAvatar = '/img/CONDOR.jpeg';
  isMenuOpen = signal(true);
  notifications: INotification[] = [];
  unreadNotificationsCount = 0;

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
    this.loadNotifications();
    
    setInterval(() => this.loadNotifications(), 30000);
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

  loadNotifications(): void {
    this.notificationsService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
      },
      error: (error) => {
        console.error('Error cargando notificaciones:', error);
        this.loadSampleNotifications();
      }
    });
  }

  private loadSampleNotifications(): void {
    this.notifications = [
      {
        id: 1,
        title: 'Productos bajo en existencia',
        message: 'El producto "Martillo Metal" tiene bajo stock (2 unidades restantes)',
        icon: 'warning',
        time: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false,
        type: 'warning'
      },
      {
        id: 2,
        title: 'Nuevo pedido recibido',
        message: 'Se ha recibido un nuevo pedido #45678 de $1,250.00',
        icon: 'shopping_cart',
        time: new Date(Date.now() - 1000 * 60 * 30),
        isRead: false,
        type: 'success'
      },
      {
        id: 3,
        title: 'Actualización del sistema',
        message: 'Nueva versión disponible (v2.3.1)',
        icon: 'system_update',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isRead: true,
        type: 'info'
      }
    ];
    this.unreadNotificationsCount = this.notifications.filter(n => !n.isRead).length;
  }

  markNotificationsAsRead(): void {
    const unreadIds = this.notifications
      .filter(n => !n.isRead)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      this.notificationsService.markAsRead(unreadIds).subscribe({
        next: () => {
          this.notifications = this.notifications.map(n => ({
            ...n,
            isRead: true
          }));
          this.unreadNotificationsCount = 0;
        },
        error: (error) => {
          console.error('Error marcando notificaciones como leídas:', error);
        }
      });
    }
  }

  handleNotificationClick(notification: INotification): void {
    if (!notification.isRead) {
      notification.isRead = true;
      this.unreadNotificationsCount--;
      this.notificationsService.markAsRead([notification.id]).subscribe();
    }
  }

  deleteNotification(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationsService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.unreadNotificationsCount = this.notifications.filter(n => !n.isRead).length;
        this.showSuccess('Notificación eliminada');
      },
      error: (error) => {
        console.error('Error eliminando notificación:', error);
        this.showError('Error al eliminar notificación');
      }
    });
  }

  clearAllNotifications(): void {
    this.notificationsService.clearAllNotifications().subscribe({
      next: () => {
        this.notifications = [];
        this.unreadNotificationsCount = 0;
        this.showSuccess('Todas las notificaciones fueron eliminadas');
      },
      error: (error) => {
        console.error('Error eliminando notificaciones:', error);
        this.showError('Error al eliminar notificaciones');
      }
    });
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