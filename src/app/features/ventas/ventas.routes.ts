
import { Router, Routes } from "@angular/router";
import { VentasComponent } from "./pages/ventas/ventas.component";
import { HistorialVentasComponent } from "./pages/historial-ventas/historial-ventas.component";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";


export const VENTA_ROUTES: Routes = [
{
    path: 'venta',
    component: VentasComponent,
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
    path: 'historial',
    component: HistorialVentasComponent,
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
}
]
