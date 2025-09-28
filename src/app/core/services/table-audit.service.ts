import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ITableAuditStatus,
  ITableAuditArrayResponse,
  ITableAuditSetRequest
} from '../../shared/models/ITableAudit';

@Injectable({
  providedIn: 'root'
})
export class TableAuditService {
  private readonly apiUrl = `${environment.baseUrlApi}/TablesEnable`;

  constructor(private http: HttpClient) { }

  getTablesStatus(): Observable<ITableAuditArrayResponse> {
    return this.http.get<ITableAuditArrayResponse>(`${this.apiUrl}/tablesStatus`);
  }

  setTableAudit(request: ITableAuditSetRequest): Observable<ITableAuditArrayResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ITableAuditArrayResponse>(`${this.apiUrl}/setTable`, request, { headers });
  }
}