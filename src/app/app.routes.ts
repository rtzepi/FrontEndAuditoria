import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { PublicLayoutComponent } from './core/layout/public-layout/public-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: LoginComponent,
        children: [
          {
            path: '',
            loadChildren: () => import('./core/public/public.routes').then(m => m.PUBLIC_ROUTES)
          },
          {
            path: 'login',
            component: LoginComponent // Ruta para el login
          }
        ]
      },
    
  {
    path: '',
    component: MainLayoutComponent, // Layout principal para rutas protegidas
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'inventario',
        loadChildren: () => import('./features/inventary/inventary.routes').then(m => m.CATALOGO_ROUTES)
      },
      {
        path: 'venta',
        loadChildren: () => import('./features/ventas/ventas.routes').then(m => m.VENTA_ROUTES)
      }
    ]
  },
  {
    path: '**', // Ruta comodín para manejar rutas no encontradas
    redirectTo: '/login' // Redirige a /login si la ruta no existe
  }
];