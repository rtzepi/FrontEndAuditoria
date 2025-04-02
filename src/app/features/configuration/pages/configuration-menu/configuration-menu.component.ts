import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { IResult } from '../../../../shared/models/IResult';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-configuration-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './configuration-menu.component.html',
  styleUrl: './configuration-menu.component.scss'
})
export class ConfigurationMenuComponent {
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
                case 'Empresa':
                  menu.icon = 'apartment';
                  break;
                case 'Categoria del Producto':
                  menu.icon = 'category';
                  break;
                case 'Unidades de Venta':
                  menu.icon = 'straighten';
                  break;
                case 'Proveedores':
                  menu.icon = 'handshake';
                  break;
                case 'Productos':
                  menu.icon ='local_shipping';
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
