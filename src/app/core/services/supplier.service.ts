import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ISupplier, ISupplierSingleResponse, ISupplierArrayResponse } from '../../shared/models/ISupplier';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly apiUrl = `${environment.baseUrlApi}/Supplier`;

  constructor(private http: HttpClient) { }

  private prepareSupplierData(supplier: ISupplier): any {
    return {
      idSupplier: supplier.idSupplier,
      nameSupplier: supplier.nameSupplier,
      nameContact: supplier.nameContact,
      phoneNumber: supplier.phoneNumber,
      phoneNumberContact: supplier.phoneNumberContact,
      email: supplier.email,
      address: supplier.address,
      status: supplier.status, // Manteniendo 'st' como en el endpoint
      observation: supplier.observation,
      created_at: supplier.created_at,
      updated_at: supplier.updated_at,
      created_by: supplier.created_by,
      deleted_at: supplier.deleted_at
    };
  }

  getSuppliers(): Observable<ISupplierArrayResponse> {
    return this.http.get<ISupplierArrayResponse>(`${this.apiUrl}/List`);
  }

  addSupplier(supplier: ISupplier): Observable<ISupplierSingleResponse> {
    const headers = new HttpHeaders({ 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    const body = this.prepareSupplierData(supplier);
    return this.http.post<ISupplierSingleResponse>(`${this.apiUrl}/Add`, body, { headers });
  }

  updateSupplier(id: number, supplier: ISupplier): Observable<ISupplierSingleResponse> {
    const headers = new HttpHeaders({ 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    const body = this.prepareSupplierData(supplier);
    return this.http.put<ISupplierSingleResponse>(`${this.apiUrl}/${id}`, body, { headers });
  }

  deleteSupplier(id: number): Observable<ISupplierSingleResponse> {
    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.delete<ISupplierSingleResponse>(`${this.apiUrl}`, {
      headers: headers,
      params: { id: id.toString() }
    });
  }
}