import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { 
    IProductResponse, 
    IProductNameResponse, 
    ICategoryResponse, 
    ISaleResponse,
    ISale
} from '../../shared/models/ISales';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private readonly apiUrl = environment.baseUrlApi;

  constructor(private http: HttpClient) { }

  getProducts(): Observable<IProductResponse> {
    return this.http.get<IProductResponse>(`${this.apiUrl}/Inventory/List`).pipe(
      catchError(this.handleError)
    );
  }

  getProductsByName(name: string): Observable<IProductNameResponse> {
    return this.http.get<IProductNameResponse>(`${this.apiUrl}/Inventory/ListByName?name=${name}`).pipe(
      catchError(this.handleError)
    );
  }

  getProductsByCategory(idCategory: number): Observable<IProductResponse> {
    return this.http.get<IProductResponse>(`${this.apiUrl}/Product/List?idCategory=${idCategory}`).pipe(
      catchError(this.handleError)
    );
  }

  getCategories(): Observable<ICategoryResponse> {
    return this.http.get<ICategoryResponse>(`${this.apiUrl}/CategoryProduct/List`).pipe(
      catchError(this.handleError)
    );
  }

  processSale(saleData: ISale): Observable<ISaleResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ISaleResponse>(`${this.apiUrl}/Sale/Add`, saleData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}