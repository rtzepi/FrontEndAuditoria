import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IEmployee, IEmployeeSingleResponse, IEmployeeArrayResponse } from '../../shared/models/IEmployee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly apiUrl = `${environment.baseUrlApi}/Employee`;

  constructor(private http: HttpClient) { }

  private prepareEmployeeData(employee: IEmployee): any {
    return {
      idEmployee: employee.idEmployee,
      firstName: employee.firstName,
      middleName: employee.middleName,
      fatherLastName: employee.fatherLastName,
      motherLastName: employee.motherLastName,
      status: employee.status,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      imgBase64: employee.imgBase64,
      idPicture: employee.idPicture || 0,
      isAuthorization: employee.isAuthorization,
      image: employee.image
    };
  }

  getEmployees(): Observable<IEmployeeArrayResponse> {
    return this.http.get<IEmployeeArrayResponse>(`${this.apiUrl}/employees`);
  }

  addEmployee(employee: IEmployee): Observable<IEmployeeSingleResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = this.prepareEmployeeData(employee);
    return this.http.post<IEmployeeSingleResponse>(`${this.apiUrl}/Add`, body, { headers });
  }

  updateEmployee(id: number, employee: IEmployee): Observable<IEmployeeSingleResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = this.prepareEmployeeData(employee);
    return this.http.put<IEmployeeSingleResponse>(`${this.apiUrl}/${id}`, body, { headers });
  }

    deleteEmployee(id: number): Observable<IEmployeeSingleResponse> {
      return this.http.delete<IEmployeeSingleResponse>(`${this.apiUrl}`, {
        params: { id: id.toString() }
      });
    }
    
  }
