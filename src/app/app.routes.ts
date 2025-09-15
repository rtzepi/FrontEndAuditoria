import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { ChangePasswordComponent } from './core/auth/pages/change-password/change-password.component';
import { HomeComponent } from './features/home/home.component';
import { PasswordRecoveryComponent } from './core/auth/pages/password-recovery/password-recovery.component'; // Añadir esta importación

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
    path: 'password-recovery', 
    component: PasswordRecoveryComponent
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
        path:'configuration',
        loadChildren: () => import('./features/configuration/configuration.routes').then(m => m.CONF_ROUTES)
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