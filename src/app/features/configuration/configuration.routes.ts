
import { Router, Routes } from "@angular/router";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";
import { ConfigurationMenuComponent } from './pages/configuration-menu/configuration-menu.component';
import {CompanyConfComponent} from './pages/company-conf/company-conf.component'
import {ProductCategoryConfComponent} from './pages/product-category-conf/product-category-conf.component'
import {SalesUnitConfComponent} from './pages/sales-unit-conf/sales-unit-conf.component'
import {SupplierConfComponent} from './pages/supplier-conf/supplier-conf.component'
import {ProductConfComponent} from './pages/product-conf/product-conf.component'

export const CONF_ROUTES: Routes = [
    {
    path: '',
    component: ConfigurationMenuComponent,
    },
    {
        path: 'companyconf',
        component: CompanyConfComponent,
    },
    {
        path: 'productcategoryconf',
        component: ProductCategoryConfComponent,
    },
    {
        path: 'salesunitconf',
        component: SalesUnitConfComponent,
    },
    {
        path: 'supplierconf',
        component: SupplierConfComponent,
    },
    {
        path: 'productconf',
        component: ProductConfComponent,
    }

];