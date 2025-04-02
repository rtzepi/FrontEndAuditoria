import { Router, Routes } from "@angular/router";
import { PurchaseHistoryComponent } from "./pages/purchase-history/purchase-history.component";
import { ShoppingMenuComponent } from "./pages/shopping-menu/shopping-menu.component";


export const SHOPPING_ROUTES: Routes = [
{
    path: '',
    component: ShoppingMenuComponent,
},
{
    path: 'purchasehistory',
    component: PurchaseHistoryComponent,
},
]
