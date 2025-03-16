
import { Router, Routes } from "@angular/router";
import { UserComponent } from "./pages/user/user.component"
import { InventoryComponent } from "./pages/inventory/inventory.component";
import { OrderComponent } from "./pages/order/order.component";
import { SalesComponent } from "./pages/sales/sales.component";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";

export const REPORTS_ROUTES: Routes = [
{
    path: 'users',
    component: UserComponent,
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
    path: 'sales',
    component: SalesComponent,

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
    path: 'shopping',
    component: OrderComponent,
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
    path: '', redirectTo: 'users', pathMatch: 'full'
}
]
