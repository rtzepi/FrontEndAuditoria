
import { Router, Routes } from "@angular/router";
import { UserComponent } from "./pages/user/user.component"
import { InventoryComponent } from "./pages/inventory/inventory.component";
import { OrderComponent } from "./pages/order/order.component";
import { SalesComponent } from "./pages/sales/sales.component";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";
import { MenuReportsComponent } from './pages/menu-reports/menu-reports.component';

export const REPORTS_ROUTES: Routes = [
    {
    path: '',
    component: MenuReportsComponent,
    },
    {
    path: 'inventory',
    component: InventoryComponent,
    }
];