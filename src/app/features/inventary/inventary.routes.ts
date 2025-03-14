

import { Router, Routes } from "@angular/router";
import { InventoryComponent } from "./pages/inventory/inventory.component";
import { PedidosComponent } from "./pages/pedidos/pedidos.component";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";

export const CATALOGO_ROUTES: Routes = [
{
    path: 'inventario',
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
    path: 'pedidos',
    component: PedidosComponent,
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
    path: '', redirectTo: 'inventario', pathMatch: 'full'
}
]
