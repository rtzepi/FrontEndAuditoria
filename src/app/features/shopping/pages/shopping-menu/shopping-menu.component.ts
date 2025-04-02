import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { IResult } from '../../../../shared/models/IResult';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-shopping-menu',
  standalone: true,
  imports: [    
    CommonModule,
    RouterLink,
    MatIconModule,
    MatCardModule],
  templateUrl: './shopping-menu.component.html',
  styleUrl: './shopping-menu.component.scss'
})
export class ShoppingMenuComponent implements OnInit{
  currentUrl: string = '';
    route = inject(Router);
    authS = inject(AuthService)
    menus:any = [];
  
  
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
                case 'Historial de Compras':
                  menu.icon ='shopping_cart';
                break;
                default:
                  menu.icon = 'settings'; 
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
