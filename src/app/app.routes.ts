import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { ChangePasswordComponent } from './core/auth/pages/change-password/change-password.component';
import { HomeComponent } from './features/home/home.component';
import { ForgetPasswordComponent } from './core/auth/pages/forget-password/forget-password.component'; // Añadir esta importación
import { ResetPasswordComponent } from './core/auth/pages/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'set-password',
    component: ChangePasswordComponent
  },
  {
    path: 'forget-password', 
    component: ForgetPasswordComponent
  },
  {
    path: 'reset-password', 
    component: ResetPasswordComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path:'security',
        loadChildren: () => import('./features/security/security.routes').then(m => m.SECURITY_ROUTES)
      }
    ]
  },
  {
    path: '**', 
    redirectTo: '/login' 
  }
];