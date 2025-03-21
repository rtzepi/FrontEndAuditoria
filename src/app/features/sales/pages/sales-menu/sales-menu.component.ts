import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { IResult } from '../../../../shared/models/IResult';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-sales-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './sales-menu.component.html',
  styleUrl: './sales-menu.component.scss'
})
export class SalesMenuComponent implements OnInit {
  currentUrl: string = '';
  route = inject(Router);
  authS = inject(AuthService);
  menus: any = [];

  ngOnInit(): void {
    this.currentUrl = this.route.url;
  
    this.authS.getChildMenus(this.currentUrl).subscribe({
      next: (response: IResult<any>) => {
        if (response.isSuccess) {
          console.log(response.value);
          this.menus = response.value.map((menu: any) => {
            switch (menu.nameMenu) {
              case 'Home':
                menu.icon = 'home';
                break;
              case 'Nueva Venta':
                menu.icon = 'paid';
                break;
              case 'Historial de Ventas':
                menu.icon = 'list_alt';
                break;
            }
            return menu;
          });
        }
      },
      error: (error) => {
        console.error('Error en autenticación:', error);
      },
    });
  }
}