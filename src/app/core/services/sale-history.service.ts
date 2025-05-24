import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ISaleResponse, ISaleDetailResponse } from '../../shared/models/ISaleHistory';

@Injectable({
    providedIn: 'root'
})
export class SaleHistoryService {
    private readonly apiUrl = environment.baseUrlApi;

    constructor(private http: HttpClient) { }

    getSales(): Observable<ISaleResponse> {
        return this.http.get<ISaleResponse>(`${this.apiUrl}/Sale/List`);
    }

    getSaleDetails(id: number): Observable<ISaleDetailResponse> {
        return this.http.get<ISaleDetailResponse>(`${this.apiUrl}/Sale/${id}`);
    }

    generateSalePdf(idSale: number): Observable<HttpResponse<Blob>> {
        return this.http.get(`${this.apiUrl}/Sale/PDForder/${idSale}`, {
            responseType: 'blob',
            observe: 'response'
        });
    }
}