import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { JwtTokenService } from '../../services/jwt-token.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  isMenuOpen = signal(true);
  jwt = inject(JwtTokenService)

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  menuItems = signal([
    { icon: 'insights', 
      label: 'ventas', 
      route: '/sales',
      subItems:[
        {
          icon: 'insights',
          label: 'Ventas',
          route: 'sales'
        },
        {
          icon: 'insights',
          label: 'Ordenes',
          route: 'record'
        }
      ],
      isExpanded: false
    },

    { icon: 'inventory_2', label: 'Inventario', route: '/inventory' }
  ]);
}
