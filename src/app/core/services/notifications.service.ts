import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IResult } from '../../shared/models/IResult';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiUrl = 'api/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<INotification[]> {
    return of([
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
      }
    ]);
  }

  markAsRead(notificationIds: number[]): Observable<IResult<boolean>> {
    return of({
      isSuccess: true,
      value: true,
      message: 'Notificaciones marcadas como leídas'
    });
  }

  deleteNotification(id: number): Observable<IResult<boolean>> {
    return of({
      isSuccess: true,
      value: true,
      message: 'Notificación eliminada'
    });
  }

  clearAllNotifications(): Observable<IResult<boolean>> {
    return of({
      isSuccess: true,
      value: true,
      message: 'Todas las notificaciones eliminadas'
    });
  }
}

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