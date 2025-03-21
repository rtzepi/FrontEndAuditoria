
import { Router, Routes } from "@angular/router";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";
import { MenuUserComponent } from "./pages/menu-user/menu-user.component";
import { UserComponent } from "./pages/user/user.component";
import {RoleComponent} from './pages/role/role.component'
import {MenuComponent} from './pages//menu/menu.component'
import {EmployeeComponent} from './pages/employee/employee.component'
import {ControlRoleMenuComponent} from './pages/control-role-menu/control-role-menu.component'


export const SECURITY_ROUTES: Routes = [
{
    path: '',
    component: MenuUserComponent,
},
{
    path: 'user',
    component: UserComponent,
},
{
    path: 'role',
    component: RoleComponent,
},
{
    path: 'menu',
    component: MenuComponent,
},
{
    path: 'employee',
    component: EmployeeComponent,
},
{
    path: 'roleMenu',
    component: ControlRoleMenuComponent,
}

]
