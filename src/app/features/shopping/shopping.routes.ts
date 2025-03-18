
import { Router, Routes } from "@angular/router";
import { ShoppingComponent } from "./pages/shopping/shopping.component";
import { ShoppingMenuComponent } from "./pages/shopping-menu/shopping-menu.component";


export const SHOPPING_ROUTES: Routes = [
    {
    path: '',
    component: ShoppingMenuComponent,
    },
    {
    path: 'shopping',
    component: ShoppingComponent,
    }
];