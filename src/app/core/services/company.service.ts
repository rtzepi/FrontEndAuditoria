import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ICompany, ICompanySingleResponse } from '../../shared/models/ICompany';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly apiUrl = `${environment.baseUrlApi}/Company`;

  constructor(private http: HttpClient) { }

  private prepareCompanyData(company: ICompany): any {
    return {
      idCompany: company.idCompany,
      companyName: company.companyName,
      phoneNumber: company.phoneNumber,
      address: company.address,
      idLogo: company.idLogo || 0,
      imgBase64: company.imgBase64,
      email: company.email,
      nit: company.nit,
      status: company.status,
      image: company.image
    };
  }

  getCompany(): Observable<ICompanySingleResponse> {
    return this.http.get<ICompanySingleResponse>(this.apiUrl);
  }

  saveCompany(company: ICompany): Observable<ICompanySingleResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = this.prepareCompanyData(company);
    return this.http.post<ICompanySingleResponse>(this.apiUrl, body, { headers });
  }
}
