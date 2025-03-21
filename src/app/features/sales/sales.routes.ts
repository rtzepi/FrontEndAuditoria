
import { Router, Routes } from "@angular/router";
import { SalesComponent } from "./pages/sales/sales.component";
import { SalesHistoryComponent } from "./pages/sales-history/sales-history.component";
import { SalesMenuComponent } from "./pages/sales-menu/sales-menu.component";



export const SALES_ROUTES: Routes = [
    {
        path: '',
        component: SalesMenuComponent,
    },
    {
        path: 'sales',
        component: SalesComponent,
    },
    {
        path: 'saleshistory',
        component: SalesHistoryComponent,    
    }
];