import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IProduct, IProductResponse } from '../../shared/models/IProduct';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.baseUrlApi}/Product`;
  private readonly categoryApiUrl = `${environment.baseUrlApi}/Category`;
  private readonly supplierApiUrl = `${environment.baseUrlApi}/Supplier`;

  constructor(private http: HttpClient) { }

  getProducts(): Observable<IProductResponse> {
    return this.http.get<IProductResponse>(`${this.apiUrl}/List`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.categoryApiUrl}/List`);
  }

  getSuppliers(): Observable<any> {
    return this.http.get(`${this.supplierApiUrl}/List`);
  }

  addProduct(productData: any): Observable<IProductResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IProductResponse>(`${this.apiUrl}/Add`, productData, { headers });
  }

  updateProduct(id: number, productData: any): Observable<IProductResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IProductResponse>(`${this.apiUrl}/${id}`, productData, { headers });
  }

  deleteProduct(id: number): Observable<IProductResponse> {
    return this.http.delete<IProductResponse>(`${this.apiUrl}`, {
      params: { id: id.toString() }
    });
  }
}









// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment.development';
// import { IProduct, IProductResponse, ICategory, ISupplier } from '../../shared/models/IProduct';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProductService {
//   private readonly apiUrl = `${environment.baseUrlApi}/Product`;
//   private readonly categoryApiUrl = `${environment.baseUrlApi}/Category`;
//   private readonly supplierApiUrl = `${environment.baseUrlApi}/Supplier`;

//   constructor(private http: HttpClient) { }

//   getProducts(): Observable<IProductResponse> {
//     return this.http.get<IProductResponse>(`${this.apiUrl}/List`);
//   }

//   getCategories(): Observable<any> {
//     return this.http.get(`${this.categoryApiUrl}/List`);
//   }

//   getSuppliers(): Observable<any> {
//     return this.http.get(`${this.supplierApiUrl}/List`);
//   }

//   addProduct(productData: any): Observable<IProductResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IProductResponse>(`${this.apiUrl}/Add`, productData, { headers });
//   }

//   updateProduct(id: number, productData: any): Observable<IProductResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.put<IProductResponse>(`${this.apiUrl}/${id}`, productData, { headers });
//   }

//   deleteProduct(id: number): Observable<IProductResponse> {
//     return this.http.delete<IProductResponse>(`${this.apiUrl}`, {
//       params: { id: id.toString() }
//     });
//   }
// }