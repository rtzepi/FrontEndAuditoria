import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IRole, IRoleResponse, IRoleRegisterRequest, IRoleUpdateRequest } from '../../shared/models/IRole';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly apiUrl = `${environment.baseUrlApi}/Role`;

  constructor(private http: HttpClient) { }

  getRoles(): Observable<IRoleResponse> {
    return this.http.get<IRoleResponse>(`${this.apiUrl}/List`);
  }

  addRole(roleData: IRoleRegisterRequest): Observable<IRoleResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IRoleResponse>(`${this.apiUrl}/Add`, roleData, { headers });
  }

  updateRole(id: number, roleData: IRoleUpdateRequest): Observable<IRoleResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IRoleResponse>(`${this.apiUrl}/${id}`, roleData, { headers });
  }

  deleteRole(id: number): Observable<IRoleResponse> {
    return this.http.delete<IRoleResponse>(`${this.apiUrl}`, {
      params: { id: id.toString() }
    });
  }
}