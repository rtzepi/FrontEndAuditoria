import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { 
    IOrderResponse, 
    IOrderRequest,
    IOrderArrayResponse,
    IOrderUpdateRequest,
    IOrderReceiveRequest,
    IOrderStatusRequest,
    ISupplierResponse,
    IProductResponse
} from '../../shared/models/INewPurchase';

@Injectable({
    providedIn: 'root'
})
export class NewPurchaseService {
    private readonly apiUrl = environment.baseUrlApi;

    constructor(private http: HttpClient) { }

    getOrders(): Observable<IOrderArrayResponse> {
        return this.http.get<IOrderArrayResponse>(`${this.apiUrl}/Order/List`);
    }

    getOrderById(id: number): Observable<IOrderResponse> {
        return this.http.get<IOrderResponse>(`${this.apiUrl}/Order/${id}`);
    }

    getSuppliers(): Observable<ISupplierResponse> {
        return this.http.get<ISupplierResponse>(`${this.apiUrl}/Supplier/List`);
    }

    getProducts(): Observable<IProductResponse> {
        return this.http.get<IProductResponse>(`${this.apiUrl}/Product/List`);
    }

    createOrder(order: IOrderRequest): Observable<IOrderResponse> {
        return this.http.post<IOrderResponse>(`${this.apiUrl}/Order/Add`, order);
    }

    updateOrder(id: number, order: IOrderUpdateRequest): Observable<IOrderResponse> {
        return this.http.put<IOrderResponse>(`${this.apiUrl}/Order/${id}`, order);
    }

    updateOrderStatus(id: number, statusRequest: IOrderStatusRequest): Observable<IOrderResponse> {
        return this.http.put<IOrderResponse>(`${this.apiUrl}/Order/Status/${id}`, statusRequest);
    }

    receiveOrder(id: number, receiveRequest: IOrderReceiveRequest): Observable<IOrderResponse> {
        return this.http.put<IOrderResponse>(`${this.apiUrl}/Order/Receive/${id}`, receiveRequest);
    }

    generatePdf(idOrder: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/Order/PDForder/${idOrder}`, {
            responseType: 'blob'
        });
    }
}