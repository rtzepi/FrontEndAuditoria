import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import path from 'path';
import { Component } from '@angular/core';
import { ChangePasswordComponent } from './core/auth/pages/change-password/change-password.component';
import { HomeComponent } from './features/home/home.component';

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
    path: 'change-password',
    component: ChangePasswordComponent
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
      },
      {
        path:'security',
        loadChildren: () => import('./features/security/user.routes').then(m => m.SALES_ROUTES)
      }
    ]
  },
  {
    path: '**', 
    redirectTo: '/login' 
  }
]

