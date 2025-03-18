
import { Router, Routes } from "@angular/router";
import { UserConfigurationComponent } from "./pages/user-configuration/user-configuration.component";
import { JwtTokenService } from "../../core/services/jwt-token.service";
import { inject } from "@angular/core";
import { ConfigurationMenuComponent } from './pages/configuration-menu/configuration-menu.component';

export const CONF_ROUTES: Routes = [
    {
    path: '',
    component: ConfigurationMenuComponent,
    },
    {
    path: 'configuration',
    component: UserConfigurationComponent,
    }
];