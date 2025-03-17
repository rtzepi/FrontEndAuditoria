
import { Router, Routes } from "@angular/router";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";
import { MenuUserComponent } from "./pages/menu-user/menu-user.component";
import { UserComponent } from "./pages/user/user.component";


export const SALES_ROUTES: Routes = [
{
    path: '',
    component: MenuUserComponent,
},
{
    path: 'user',
    component: UserComponent,
}
]
