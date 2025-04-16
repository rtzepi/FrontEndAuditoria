
import { Router, Routes } from "@angular/router";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";
import {CashClosingComponent} from '../cash/pages/cash-closing/cash-closing.component'
import {CashOpeningComponent} from '../cash/pages/cash-opening/cash-opening.component'
import {CashMenuComponent} from '../cash/pages/cash-menu/cash-menu.component'



export const CASH_ROUTES: Routes = [
{
    path: '',
    component: CashMenuComponent,
},
{
    path: 'cashopening',
    component: CashOpeningComponent,
},
{
    path: 'cashclosing',
    component: CashClosingComponent,
}

]
