import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { IResult } from '../../../../shared/models/IResult';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-menu-user',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
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
          console.log(response.value)
          this.menus = response.value;
        } else {
          // this.errorMessage = response.error || 'Error en autenticación.';
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
  menu: any = [];



}
