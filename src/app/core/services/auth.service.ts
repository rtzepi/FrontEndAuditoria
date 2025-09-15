import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../../app/environments/environment.development';
import { IResult } from '../../shared/models/IResult';
import { ILoginResponse, IMFAVerificationRequest, IPasswordResetRequest, IValidateTokenRequest, IResetPasswordWithTokenRequest } from '../../shared/models/IUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.baseUrlApi}/User`;

  constructor(
    private http: HttpClient,
    private localStorageS: LocalStorageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(username: string, password: string): Observable<IResult<ILoginResponse>> {
    return this.http.post<IResult<ILoginResponse>>(`${this.apiUrl}/login`, { 
      userName: username, 
      password: password 
    }).pipe(
      tap((response) => {
        if (response?.isSuccess && response.value?.token && isPlatformBrowser(this.platformId)) {
          this.localStorageS.set('token', response.value.token);
          this.localStorageS.set('userData', JSON.stringify(response.value));
          
          // Store MFA status if needed
          if (response.value.requiresMFA) {
            this.localStorageS.set('mfaUserId', response.value.userId?.toString() || '');
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  verifyMFA(request: IMFAVerificationRequest): Observable<IResult<ILoginResponse>> {
    return this.http.post<IResult<ILoginResponse>>(`${this.apiUrl}/verify-mfa`, request).pipe(
      tap((response) => {
        if (response?.isSuccess && response.value?.token && isPlatformBrowser(this.platformId)) {
          this.localStorageS.set('token', response.value.token);
          this.localStorageS.set('userData', JSON.stringify(response.value));
          this.localStorageS.remove('mfaUserId'); // Remove MFA user ID after successful verification
        }
      }),
      catchError(this.handleError)
    );
  }

  requestPasswordReset(request: IPasswordResetRequest): Observable<IResult<string>> {
    return this.http.post<IResult<string>>(`${this.apiUrl}/request-password-reset`, request)
      .pipe(catchError(this.handleError));
  }

  validateResetToken(request: IValidateTokenRequest): Observable<IResult<boolean>> {
    return this.http.post<IResult<boolean>>(`${this.apiUrl}/validate-reset-token`, request)
      .pipe(catchError(this.handleError));
  }

  resetPasswordWithToken(request: IResetPasswordWithTokenRequest): Observable<IResult<string>> {
    return this.http.post<IResult<string>>(`${this.apiUrl}/reset-password-with-token`, request)
      .pipe(catchError(this.handleError));
  }

  logout(): Observable<IResult<boolean>> {
    return this.http.post<IResult<boolean>>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearAuthData()),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  clearAuthData(): void {
    this.localStorageS.remove('token');
    this.localStorageS.remove('userData');
    this.localStorageS.remove('mfaUserId');
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/auth/login']);
    }
  }

  changePassword(newPassword: string, confirmPassword: string): Observable<IResult<any>> {
    return this.http.post<IResult<any>>(
      `${this.apiUrl}/changePassword`, 
      { password: newPassword, confirmPassword }
    ).pipe(catchError(this.handleError));
  }

  getAccessMenus(): Observable<IResult<any>> {
    return this.http.get<IResult<any>>(`${this.apiUrl}/Access`)
      .pipe(catchError(this.handleError));
  }

  getChildMenus(parentRoute: string): Observable<IResult<any>> {
    return this.http.get<IResult<any>>(`${this.apiUrl}/getChildMenu`, {
      params: new HttpParams().set('parentRoute', parentRoute)
    }).pipe(catchError(this.handleError));
  }

  getMFASettings(): boolean {
    const userData = this.localStorageS.get('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.MFAEnabled || false;
    }
    return false;
  }

  setMFASettings(enabled: boolean): void {
    const userData = this.localStorageS.get('userData');
    if (userData) {
      const user = JSON.parse(userData);
      user.MFAEnabled = enabled;
      this.localStorageS.set('userData', JSON.stringify(user));
    }
  }

  getMFAUserId(): number | null {
    const userId = this.localStorageS.get('mfaUserId');
    return userId ? parseInt(userId, 10) : null;
  }

  private handleError(error: HttpErrorResponse) {
    const errorMessage = error.error?.error || error.message || 'Error desconocido';
    return throwError(() => new Error(errorMessage));
  }

  isAuthenticated(): boolean {
    return isPlatformBrowser(this.platformId) && !!this.localStorageS.get('token');
  }
}