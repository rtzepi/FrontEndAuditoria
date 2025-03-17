import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../../environments/environment.development';
import { IResult } from '../../shared/models/IResult';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.baseUrlApi}/User`;

  constructor(
    private http: HttpClient,
    private localStorageS: LocalStorageService,
    private router: Router
  ) {}

  login(username: string, password: string): Observable<IResult<any>> {
    return this.http.post<IResult<any>>(`${this.apiUrl}/login`, { Username: username, Password: password })
      .pipe(
        tap(
          (response: any) => {
            if (response && response.isSuccess) {
              const token = response.value;
              this.localStorageS.set('token', JSON.stringify((token?.token)));
            }
          }
        )
      )
  }

  logout() {
  }

  changePassword(newPassword: string, confirmPassword: string): Observable<IResult<any>> {
    return this.http.post<IResult<any>>(`${this.apiUrl}/changePassword`, {password: newPassword, confirmPassword }) 
  }

  getAccessMenus(): Observable<IResult<any>> {
    return this.http.get<IResult<any>>(`${this.apiUrl}/Access`) 
  }

  getChildMenus(parentRoute: string): Observable<IResult<any>> {
    const params = new HttpParams().set('parentRoute', parentRoute);
    return this.http.get<IResult<any>>(`${this.apiUrl}/getChildMenu`, { params });
  }
}