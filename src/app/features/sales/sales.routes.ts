
import { Router, Routes } from "@angular/router";
import { SalesComponent } from "./pages/sales/sales.component";
import { SalesHistoryComponent } from "./pages/sales-history/sales-history.component";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";


export const SALES_ROUTES: Routes = [
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
    path: 'record',
    component: SalesHistoryComponent,
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
