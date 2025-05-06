
import { Router, Routes } from "@angular/router";
import { UserReportComponent } from "./pages/user-report/user-report.component"
import { PurchasingReportComponent } from "./pages/purchasing-report/purchasing-report.component";
import { SalesReportComponent } from "./pages/sales-report/sales-report.component";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";
import { MenuReportsComponent } from './pages/menu-reports/menu-reports.component';
import { ReportComponent } from "./pages/report/report.component";

export const REPORTS_ROUTES: Routes = [
    {
    path: '',
    component: ReportComponent,
    }
];