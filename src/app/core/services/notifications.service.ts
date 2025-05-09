import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IResult } from '../../shared/models/IResult';

interface INotification {
  id: number;
  title: string;
  message: string;
  icon?: string;
  time: Date;
  type?: 'default' | 'warning' | 'success' | 'info';
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor() {}

  transformNotifications(notifyList: any[]): INotification[] {
    if (!notifyList || !Array.isArray(notifyList)) return [];

    return notifyList.flatMap((group, groupIndex) => {
      if (group.productosEnStockMin?.length > 0) {
        return group.productosEnStockMin.map((product: any, index: number) => ({
          id: groupIndex * 1000 + index,
          title: product.titulo || 'Producto bajo en stock',
          message: `${product.nombre} (ID: ${product.idProduct}) - Stock actual: ${product.stockActual} (Mínimo requerido: ${product.stockMin})`,
          icon: 'warning',
          time: new Date(),
          type: 'warning',
          data: {
            idProduct: product.idProduct,
            nombre: product.nombre,
            stockActual: product.stockActual,
            stockMin: product.stockMin
          }
        }));
      }
      return [];
    });
  }
}