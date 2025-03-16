

import { Router, Routes } from "@angular/router";
import { InventoryComponent } from "./pages/inventory/inventory.component";
import { OrdersComponent } from "./pages/orders/orders.component";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";

export const CATALOG_ROUTES: Routes = [
{
    path: 'inventory',
    component: InventoryComponent,
    canActivate: [
    () => {
        const jwt = inject(JwtTokenService);
        if (!jwt.isTokenExpired()) {
        return true
        }
        const router = inject(Router);
        router.navigate(['/iniciarSesion'])
        return false
    }
    ],
},
{
    path: 'orders',
    component: OrdersComponent,
    canActivate: [
    () => {
        const jwt = inject(JwtTokenService);
        if (!jwt.isTokenExpired()) {
        return true
        }
        const router = inject(Router);
        router.navigate(['/iniciarSesion'])
        return false
    }
    ],
},
{
    path: '', redirectTo: 'inventory', pathMatch: 'full'
}
]
