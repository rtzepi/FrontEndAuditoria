import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IUnitOfSale, IUnitOfSaleResponse } from '../../shared/models/IUnit';

@Injectable({
  providedIn: 'root'
})
export class UnitOfSaleService {
  private readonly apiUrl = `${environment.baseUrlApi}/UnityOfSale`;

  constructor(private http: HttpClient) { }

  getUnits(): Observable<IUnitOfSaleResponse> {
    return this.http.get<IUnitOfSaleResponse>(`${this.apiUrl}/List`);
  }

  addUnit(unitData: IUnitOfSale): Observable<IUnitOfSaleResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IUnitOfSaleResponse>(`${this.apiUrl}/Add`, unitData, { headers });
  }

  updateUnit(id: number, unitData: IUnitOfSale): Observable<IUnitOfSaleResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IUnitOfSaleResponse>(`${this.apiUrl}/${id}`, unitData, { headers });
  }

  deleteUnit(id: number): Observable<IUnitOfSaleResponse> {
    return this.http.delete<IUnitOfSaleResponse>(`${this.apiUrl}`, {
      params: { id: id.toString() }
    });
  }
}