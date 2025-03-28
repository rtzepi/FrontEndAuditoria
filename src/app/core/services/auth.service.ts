import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../../app/environments/environment.development';
import { IResult } from '../../shared/models/IResult';

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

  login(username: string, password: string): Observable<IResult<any>> {
    return this.http.post<IResult<any>>(`${this.apiUrl}/login`, { 
      Username: username, 
      Password: password 
    }).pipe(
      tap((response) => {
        if (response?.isSuccess && isPlatformBrowser(this.platformId)) {
          this.localStorageS.set('token', JSON.stringify(response.value?.token));
          this.localStorageS.set('userData', JSON.stringify(response.value));
        }
      }),
      catchError(this.handleError)
    );
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

  private handleError(error: HttpErrorResponse) {
    const errorMessage = error.error?.message || error.message || 'Error desconocido';
    return throwError(() => new Error(errorMessage));
  }

  isAuthenticated(): boolean {
    return isPlatformBrowser(this.platformId) && !!this.localStorageS.get('token');
  }
}