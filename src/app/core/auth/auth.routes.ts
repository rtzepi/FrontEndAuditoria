import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';
import { MFAVerificationComponent } from './pages/mfa-verification/mfa-verification.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const AuthRoutes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'set-password',
        component: ChangePasswordComponent
    },
    {
        path: 'mfa-verification',
        component: MFAVerificationComponent
    },
    {
        path: 'forget-password',
        component: ForgetPasswordComponent
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent
    }

];
