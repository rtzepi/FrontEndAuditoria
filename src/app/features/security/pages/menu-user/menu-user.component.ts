import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { IResult } from '../../../../shared/models/IResult';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';



@Component({
  selector: 'app-menu-user',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './menu-user.component.html',
  styleUrl: './menu-user.component.scss'
})

export class MenuUserComponent implements OnInit {
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
                menu.icon = 'security';
                break;
              case 'Usuario':
                menu.icon = 'person';
                break;
              case 'Role':
                menu.icon = 'admin_panel_settings';
                break;
              case 'Empleado':
                menu.icon = 'badge';
                break;
              case 'Menu':
                menu.icon = 'menu';
                break;
              case 'Control role menu':
                menu.icon = 'settings';
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

  // ngOnInit(): void {
  //   this.currentUrl = this.route.url;

  //   this.authS.getChildMenus(this.currentUrl).subscribe({
  //     next: (response: IResult<any>) => {
  //       if (response.isSuccess) {
  //         console.log(response.value)
  //         this.menus = response.value;
  //       } else {
  //         // this.errorMessage = response.error || 'Error en autenticación.';
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error en autenticación:', error);
  //       console.log(error)
  //     },
  //     complete: () => {
  //     },
  //   });
  // }
  // menu: any = [];



}
