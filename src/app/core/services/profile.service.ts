import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IProfileResponse, IProfile } from '../../shared/models/IProfile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly apiUrl = `${environment.baseUrlApi}/User`;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<IProfileResponse> {
    return this.http.get<IProfileResponse>(`${this.apiUrl}/profile`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en ProfileService:', error);
    const errorMessage = error.error?.message || error.message || 'Error al obtener el perfil';
    return throwError(() => new Error(errorMessage));
  }
}