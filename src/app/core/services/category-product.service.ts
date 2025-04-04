import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../app/environments/environment.development';
import { ICategoryProduct, ICategoryProductResponse } from '../../shared/models/ICategoryProduct';

@Injectable({
  providedIn: 'root'
})
export class CategoryProductService {
  private readonly apiUrl = `${environment.baseUrlApi}/CategoryProduct`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<ICategoryProductResponse> {
    return this.http.get<ICategoryProductResponse>(`${this.apiUrl}/List`)
  }

  
  addCategory(category: ICategoryProduct): Observable<ICategoryProductResponse> {
    console.log(category) 
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ICategoryProductResponse>(`${this.apiUrl}/Add`, category, { headers })
  }

  updateCategory(id: number, category: ICategoryProduct): Observable<ICategoryProductResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<ICategoryProductResponse>(`${this.apiUrl}/${id}`, category, { headers })

  }

  deleteCategory(id: number): Observable<ICategoryProductResponse> {
    return this.http.delete<ICategoryProductResponse>(`${this.apiUrl}?id=${id}`)
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en CategoryProductService:', error);
    let errorMessage = error.error?.message || 'Ocurrió un error al procesar la categoría';
    return throwError(() => new Error(errorMessage));
  }
}