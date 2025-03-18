import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { JwtTokenService } from '../../services/jwt-token.service';
import { AuthService } from '../../services/auth.service';
import { IResult } from '../../../shared/models/IResult';

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
export class MainLayoutComponent implements OnInit {
  menuItems: any= [];


  ngOnInit(): void {
    this.authS.getAccessMenus().subscribe({
      next: (response: IResult<any>) => {
        console.log('Respuesta del servicio:', response);
        if (response.isSuccess) {
          this.menuItems = response.value.menus;

          
          console.log(response.value.menus)
        } else {
        }
      },
      error: (error) => {
        console.error('Error en autenticación:', error);
        console.log(error)
      },
      complete: () => {
      },
    });
  }

  isMenuOpen = signal(true);
  jwt = inject(JwtTokenService);
  authS = inject(AuthService);



  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

}
