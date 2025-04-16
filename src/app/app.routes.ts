import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import path from 'path';
import { Component } from '@angular/core';
import { ChangePasswordComponent } from './core/auth/pages/change-password/change-password.component';
import { HomeComponent } from './features/home/home.component';
import { SalesComponent } from './features/sales/pages/sales/sales.component';

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
        path: 'sales',
        loadChildren: () => import('./features/sales/sales.routes').then(m => m.SALES_ROUTES)
      },
      {
        path: 'inventory',
        loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.CATALOG_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },
      {
        path:'configuration',
        loadChildren: () => import('./features/configuration/configuration.routes').then(m => m.CONF_ROUTES)
      },
      {
        path:'shopping',
        loadChildren: () => import('./features/shopping/shopping.routes').then(m => m.SHOPPING_ROUTES)
      },
      {
        path:'security',
        loadChildren: () => import('./features/security/security.routes').then(m => m.SECURITY_ROUTES)
      },
      {
        path:'cash',
        loadChildren: () => import('./features/cash/cash.routes').then(m => m.CASH_ROUTES)
      }
    ]
  },
  {
    path: '**', 
    redirectTo: '/login' 
  }
]

