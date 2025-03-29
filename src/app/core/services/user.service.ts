import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IUser, IUserResponse, IEmployee, IRole } from '../../shared/models/IUser';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.baseUrlApi}/User`;
  private readonly employeeApiUrl = `${environment.baseUrlApi}/Employee`;
  private readonly roleApiUrl = `${environment.baseUrlApi}/Role`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<IUserResponse> {
    return this.http.get<IUserResponse>(`${this.apiUrl}/users`);
  }

  getEmployees(): Observable<any> {
    return this.http.get(`${this.employeeApiUrl}/employees`);
  }

  getRoles(): Observable<any> {
    return this.http.get(`${this.roleApiUrl}/List`);
  }

  registerUser(userData: any): Observable<IUserResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IUserResponse>(`${this.apiUrl}/register`, userData, { headers });
  }

  updateUser(id: number, userData: any): Observable<IUserResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IUserResponse>(`${this.apiUrl}/${id}`, userData, { headers });
  }

  deleteUser(id: number): Observable<IUserResponse> {
    return this.http.delete<IUserResponse>(`${this.apiUrl}`, {
      params: { id: id.toString() }
    });
  }
}