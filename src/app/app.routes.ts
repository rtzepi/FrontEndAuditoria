import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { PublicLayoutComponent } from './core/layout/public-layout/public-layout.component';
import path from 'path';
import { Component } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        component: LoginComponent
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'sale',
        loadChildren: () => import('./features/sales/sales.routes').then(m => m.SALES_ROUTES)
      },
      {
        path: 'inventory',
        loadChildren: () => import('./features/inventory/inventary.routes').then(m => m.CATALOG_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      }
    ]
  }
]

// export const routes: Routes = [
//   {
//     path: '',
//     loadChildren: () => import('./core/auth/auth.routes').then(m => m.AuthRoutes)
//   } ,   
//   {
//     path: '',
//     component: MainLayoutComponent, 
//     children: [
//       {
//         path: 'sale',
//         loadChildren: () => import('./features/sales/ventas.routes').then(m => m.SALES_ROUTES)
//       },
//       {
//         path: 'inventory',
//         loadChildren: () => import('./features/inventory/inventary.routes').then(m => m.CATALOG_ROUTES)
//       },
//       {
//         path: 'reports',
//         loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
//       }
//     ]
//   },
//   {
//     path: '**', // Ruta comodín para manejar rutas no encontradas
//     redirectTo: '/login' // Redirige a /login si la ruta no existe
//   }
// ];