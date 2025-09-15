import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { PasswordRecoveryComponent } from './pages/password-recovery/password-recovery.component';
import { MFAVerificationComponent } from './pages/mfa-verification/mfa-verification.component';

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
        path: 'password-recovery',
        component: PasswordRecoveryComponent
    }

];
