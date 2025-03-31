import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../app/environments/environment.development';
import { IMenu, IMenuResponse } from '../../shared/models/IMenu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly apiUrl = `${environment.baseUrlApi}/Menu`;

  constructor(private http: HttpClient) { }

  getMenus(): Observable<IMenuResponse> {
    return this.http.get<IMenuResponse>(`${this.apiUrl}/List`).pipe(
      catchError(this.handleError)
    );
  }

  addMenu(menu: IMenu): Observable<IMenuResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IMenuResponse>(`${this.apiUrl}/Add`, menu, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateMenu(id: number, menu: IMenu): Observable<IMenuResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IMenuResponse>(`${this.apiUrl}/${id}`, menu, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteMenu(id: number): Observable<IMenuResponse> {
    return this.http.delete<IMenuResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en MenuService:', error);
    let errorMessage = error.error?.message || 'Ocurrió un error en la operación';
    return throwError(() => new Error(errorMessage));
  }
}
