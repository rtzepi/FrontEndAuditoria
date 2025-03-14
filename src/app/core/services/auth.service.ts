import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../../environments/environment.development';

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

  // Método para iniciar sesión
  login(userName: string, password: string): Observable<any> {
    const body = { UserName: userName, Password: password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(`${this.apiUrl}/login`, body, { headers }).pipe(
      map((response) => {
        if (response.isSuccess && response.value.token) {
          // Guardar el token en el localStorage
          this.localStorageS.set('token', response.value.token);
          // Devolver el estado de isFirstLogin
          return { success: true, isFirstLogin: response.value.isFirstLogin };
        } else {
          return { success: false };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en la autenticación:', error);
        if (error.status === 0) {
          // Error de red (servidor no disponible)
          return throwError(() => new Error('No se pudo conectar al servidor.'));
        } else {
          // Error del servidor (400, 401, 500, etc.)
          return throwError(() => new Error('Error en la autenticación. Inténtalo de nuevo.'));
        }
      })
    );
  }
}