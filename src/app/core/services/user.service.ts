import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUser, IUserResponse, IEmployee, IRole, IResetPasswordResponse, IResetPasswordRequest, IResetPasswordWithTokenRequest, IMFASetupResponse, IForgetPasswordRequest } from '../../shared/models/IUser';

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

  updateMFASettings(id: number, mfaEnabled: boolean): Observable<IUserResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<IUserResponse>(`${this.apiUrl}/${id}/mfa`, { mfaEnabled }, { headers });
  }

  setPassword(request: IResetPasswordWithTokenRequest): Observable<IResetPasswordResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResetPasswordResponse>(
      `${this.apiUrl}/set-password`, 
      request, 
      { headers }
    );
  }

  resetPassword(request: IResetPasswordWithTokenRequest): Observable<IResetPasswordResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResetPasswordResponse>(
      `${this.apiUrl}/reset-password`, 
      request, 
      { headers }
    );
  }

  forgetPassword(request: IForgetPasswordRequest): Observable<IUserResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IUserResponse>(
      `${this.apiUrl}/forget-password`, 
      request, 
      { headers }
    );
  }

  deleteUser(id: number): Observable<IUserResponse> {
    return this.http.delete<IUserResponse>(`${this.apiUrl}`, {
      params: { id: id.toString() }
    });
  }
}



// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';
// import { IUser, IUserResponse, IEmployee, IRole, IResetPasswordResponse, IResetPasswordRequest, IResetPasswordWithTokenRequest, IMFASetupResponse, IForgetPasswordRequest } from '../../shared/models/IUser';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {
//   private readonly apiUrl = `${environment.baseUrlApi}/User`;
//   private readonly employeeApiUrl = `${environment.baseUrlApi}/Employee`;
//   private readonly roleApiUrl = `${environment.baseUrlApi}/Role`;

//   constructor(private http: HttpClient) { }

//   getUsers(): Observable<IUserResponse> {
//     return this.http.get<IUserResponse>(`${this.apiUrl}/users`);
//   }

//   getEmployees(): Observable<any> {
//     return this.http.get(`${this.employeeApiUrl}/employees`);
//   }

//   getRoles(): Observable<any> {
//     return this.http.get(`${this.roleApiUrl}/List`);
//   }

//   registerUser(userData: any): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IUserResponse>(`${this.apiUrl}/register`, userData, { headers });
//   }

//   updateUser(id: number, userData: any): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.put<IUserResponse>(`${this.apiUrl}/${id}`, userData, { headers });
//   }

//   updateMFASettings(id: number, mfaEnabled: boolean): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.patch<IUserResponse>(`${this.apiUrl}/${id}/mfa`, { mfaEnabled }, { headers });
//   }

//   setPassword(request: IResetPasswordWithTokenRequest): Observable<IResetPasswordResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IResetPasswordResponse>(
//       `${this.apiUrl}/set-password`, 
//       request, 
//       { headers }
//     );
//   }

//   forgetPassword(request: IForgetPasswordRequest): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IUserResponse>(
//       `${this.apiUrl}/forget-password`, 
//       request, 
//       { headers }
//     );
//   }

//   deleteUser(id: number): Observable<IUserResponse> {
//     return this.http.delete<IUserResponse>(`${this.apiUrl}`, {
//       params: { id: id.toString() }
//     });
//   }
// }



// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';
// import { IUser, IUserResponse, IEmployee, IRole, IResetPasswordResponse, IResetPasswordRequest, IResetPasswordWithTokenRequest, IMFASetupResponse, IForgetPasswordRequest } from '../../shared/models/IUser';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {
//   private readonly apiUrl = `${environment.baseUrlApi}/User`;
//   private readonly employeeApiUrl = `${environment.baseUrlApi}/Employee`;
//   private readonly roleApiUrl = `${environment.baseUrlApi}/Role`;

//   constructor(private http: HttpClient) { }

//   getUsers(): Observable<IUserResponse> {
//     return this.http.get<IUserResponse>(`${this.apiUrl}/users`);
//   }

//   getEmployees(): Observable<any> {
//     return this.http.get(`${this.employeeApiUrl}/employees`);
//   }

//   getRoles(): Observable<any> {
//     return this.http.get(`${this.roleApiUrl}/List`);
//   }

//   registerUser(userData: any): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IUserResponse>(`${this.apiUrl}/register`, userData, { headers });
//   }

//   updateUser(id: number, userData: any): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.put<IUserResponse>(`${this.apiUrl}/${id}`, userData, { headers });
//   }

//   updateMFASettings(id: number, mfaEnabled: boolean): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.patch<IUserResponse>(`${this.apiUrl}/${id}/mfa`, { mfaEnabled }, { headers });
//   }

//   setPassword(request: IResetPasswordWithTokenRequest): Observable<IResetPasswordResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IResetPasswordResponse>(
//       `${this.apiUrl}/set-password`, 
//       request, 
//       { headers }
//     );
//   }

//   // Nuevo método para forget-password
//   forgetPassword(request: IForgetPasswordRequest): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IUserResponse>(
//       `${this.apiUrl}/forget-password`, 
//       request, 
//       { headers }
//     );
//   }

//   deleteUser(id: number): Observable<IUserResponse> {
//     return this.http.delete<IUserResponse>(`${this.apiUrl}`, {
//       params: { id: id.toString() }
//     });
//   }
// }





// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';
// import { IUser, IUserResponse, IEmployee, IRole, IResetPasswordResponse, IResetPasswordRequest, IResetPasswordWithTokenRequest, IMFASetupResponse } from '../../shared/models/IUser';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {
//   private readonly apiUrl = `${environment.baseUrlApi}/User`;
//   private readonly employeeApiUrl = `${environment.baseUrlApi}/Employee`;
//   private readonly roleApiUrl = `${environment.baseUrlApi}/Role`;

//   constructor(private http: HttpClient) { }

//   getUsers(): Observable<IUserResponse> {
//     return this.http.get<IUserResponse>(`${this.apiUrl}/users`);
//   }

//   getEmployees(): Observable<any> {
//     return this.http.get(`${this.employeeApiUrl}/employees`);
//   }

//   getRoles(): Observable<any> {
//     return this.http.get(`${this.roleApiUrl}/List`);
//   }

//   registerUser(userData: any): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IUserResponse>(`${this.apiUrl}/register`, userData, { headers });
//   }

//   updateUser(id: number, userData: any): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.put<IUserResponse>(`${this.apiUrl}/${id}`, userData, { headers });
//   }

//   updateMFASettings(id: number, mfaEnabled: boolean): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.patch<IUserResponse>(`${this.apiUrl}/${id}/mfa`, { mfaEnabled }, { headers });
//   }

//   setPassword(request: IResetPasswordWithTokenRequest): Observable<IResetPasswordResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IResetPasswordResponse>(
//       `${this.apiUrl}/set-password`, 
//       request, 
//       { headers }
//     );
//   }

//   deleteUser(id: number): Observable<IUserResponse> {
//     return this.http.delete<IUserResponse>(`${this.apiUrl}`, {
//       params: { id: id.toString() }
//     });
//   }
// }



// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment.development';
// import { IUser, IUserResponse, IEmployee, IRole, IResetPasswordResponse, IResetPasswordRequest, IResetPasswordWithTokenRequest } from '../../shared/models/IUser';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {
//   private readonly apiUrl = `${environment.baseUrlApi}/User`;
//   private readonly employeeApiUrl = `${environment.baseUrlApi}/Employee`;
//   private readonly roleApiUrl = `${environment.baseUrlApi}/Role`;

//   constructor(private http: HttpClient) { }

//   getUsers(): Observable<IUserResponse> {
//     return this.http.get<IUserResponse>(`${this.apiUrl}/users`);
//   }

//   getEmployees(): Observable<any> {
//     return this.http.get(`${this.employeeApiUrl}/employees`);
//   }

//   getRoles(): Observable<any> {
//     return this.http.get(`${this.roleApiUrl}/List`);
//   }

//   registerUser(userData: any): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IUserResponse>(`${this.apiUrl}/register`, userData, { headers });
//   }

//   updateUser(id: number, userData: any): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.put<IUserResponse>(`${this.apiUrl}/${id}`, userData, { headers });
//   }

//   updateMFASettings(id: number, mfaEnabled: boolean): Observable<IUserResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.patch<IUserResponse>(`${this.apiUrl}/${id}/mfa`, { mfaEnabled }, { headers });
//   }

//   setPassword(request: IResetPasswordWithTokenRequest){
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<IResetPasswordResponse>(
//       `${this.apiUrl}/set-password`, 
//       request, 
//       { headers }
//     );
//   }

//   deleteUser(id: number): Observable<IUserResponse> {
//     return this.http.delete<IUserResponse>(`${this.apiUrl}`, {
//       params: { id: id.toString() }
//     });
//   }
// }