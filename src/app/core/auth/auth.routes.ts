import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { SalesComponent } from '../../features/sales/pages/sales/sales.component';
import { InventoryComponent } from '../../features/inventory/pages/inventory/inventory.component';

export const AuthRoutes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'change-password',
        component: ChangePasswordComponent
    },
    {
        path: 'sales',
        component: SalesComponent
    },
    {
        path: 'inventory',
        component: InventoryComponent
    }
];
