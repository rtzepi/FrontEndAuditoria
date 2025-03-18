import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { IResult } from '../../../../shared/models/IResult';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-menu-inventory',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './menu-inventory.component.html',
  styleUrl: './menu-inventory.component.scss'
})
export class MenuInventoryComponent implements OnInit {
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
              case 'Seguridad':
                menu.icon = 'inventory';
                break;
              case 'Usuario':
                menu.icon = 'order';
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