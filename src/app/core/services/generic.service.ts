import { Injectable } from '@angular/core';
import { environment } from '../../../app/environments/environment.development';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { IResult } from '../../shared/models/IResult';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenericService {
  private readonly apiUrl = `${environment.baseUrlApi}/report`;

  constructor(private http: HttpClient) { }

  generate(data: any): Observable<HttpResponse<Blob>> {
    console.log(data);
    return this.http.post(`${this.apiUrl}`, data, {
      responseType: 'blob',
      observe: 'response'
    });
  }

}
