import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { IResult } from '../../../../shared/models/IResult';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-menu-reports',
  standalone: true,
    imports: [
      CommonModule,
      RouterLink,
      MatIconModule,
      MatCardModule
    ],
  templateUrl: './menu-reports.component.html',
  styleUrl: './menu-reports.component.scss'
})
export class MenuReportsComponent {
  currentUrl: string = '';
  route = inject(Router);
  authS = inject(AuthService)
  menus:any = [];
  

}
