import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { 
    IOrderResponse, 
    IOrderRequest,
    IOrderArrayResponse
} from '../../shared/models/INewPurchase';
import { ISupplierArrayResponse } from '../../shared/models/IProduct';

@Injectable({
    providedIn: 'root'
})
export class NewPurchaseService {
    private readonly apiUrl = environment.baseUrlApi;

    constructor(private http: HttpClient) { }

    getSuppliers(): Observable<ISupplierArrayResponse> {
        return this.http.get<ISupplierArrayResponse>(`${this.apiUrl}/Supplier/List`);
    }

    createOrder(order: IOrderRequest): Observable<IOrderResponse> {
        return this.http.post<IOrderResponse>(`${this.apiUrl}/Order/Add`, order);
    }

    generatePdf(idOrder: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/Order/PDForder/${idOrder}`, {
            responseType: 'blob'
        });
    }
}