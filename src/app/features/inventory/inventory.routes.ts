import { Router, Routes } from "@angular/router";
import { InventoryComponent } from "./pages/inventory/inventory.component";
import { OrdersComponent } from "./pages/orders/orders.component";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";
import { MenuInventoryComponent } from "./pages/menu-inventory/menu-inventory.component";

export const CATALOG_ROUTES: Routes = [
    {
        path: '',
        component: MenuInventoryComponent,
    },
    {
        path: 'inventory',
        component: InventoryComponent,
    },
    {
        path: 'orders',
        component: OrdersComponent
    }
];