import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
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
    IInventoryResponse,
    IOrderDetail
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

    getProducts(): Observable<IInventoryResponse> {
        return this.http.get<IInventoryResponse>(`${this.apiUrl}/Product/List`);
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
        return this.http.post<IOrderResponse>(`${this.apiUrl}/Order/Receive/${id}`, receiveRequest);
    }

    generatePdf(idOrder: number): Observable<HttpResponse<Blob>> {
        return this.http.get(`${this.apiUrl}/Order/PDForder/${idOrder}`, {
            responseType: 'blob',
            observe: 'response'
        });
    }
}

// import { Injectable } from '@angular/core';
// import { HttpClient, HttpResponse } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment.development';
// import { 
//     IOrderResponse, 
//     IOrderRequest,
//     IOrderArrayResponse,
//     IOrderUpdateRequest,
//     IOrderReceiveRequest,
//     IOrderStatusRequest,
//     ISupplierResponse,
//     IInventoryResponse,
//     IOrderDetail
// } from '../../shared/models/INewPurchase';

// @Injectable({
//     providedIn: 'root'
// })
// export class NewPurchaseService {
//     private readonly apiUrl = environment.baseUrlApi;

//     constructor(private http: HttpClient) { }

//     getOrders(): Observable<IOrderArrayResponse> {
//         return this.http.get<IOrderArrayResponse>(`${this.apiUrl}/Order/List`);
//     }

//     getOrderById(id: number): Observable<IOrderResponse> {
//         return this.http.get<IOrderResponse>(`${this.apiUrl}/Order/${id}`);
//     }

//     getSuppliers(): Observable<ISupplierResponse> {
//         return this.http.get<ISupplierResponse>(`${this.apiUrl}/Supplier/List`);
//     }

//     getProductsByCategory(idCategory: number): Observable<IInventoryResponse> {
//         return this.http.get<IInventoryResponse>(`${this.apiUrl}/Inventory/List?id=${idCategory}`);
//     }

//     createOrder(order: IOrderRequest): Observable<IOrderResponse> {
//         return this.http.post<IOrderResponse>(`${this.apiUrl}/Order/Add`, order);
//     }

//     updateOrder(id: number, order: IOrderUpdateRequest): Observable<IOrderResponse> {
//         return this.http.put<IOrderResponse>(`${this.apiUrl}/Order/${id}`, order);
//     }

//     updateOrderStatus(id: number, statusRequest: IOrderStatusRequest): Observable<IOrderResponse> {
//         return this.http.put<IOrderResponse>(`${this.apiUrl}/Order/Status/${id}`, statusRequest);
//     }

//     receiveOrder(id: number, receiveRequest: IOrderReceiveRequest): Observable<IOrderResponse> {
//         return this.http.post<IOrderResponse>(`${this.apiUrl}/Order/Receive/${id}`, receiveRequest);
//     }

//     generatePdf(idOrder: number): Observable<HttpResponse<Blob>> {
//         return this.http.get(`${this.apiUrl}/Order/PDForder/${idOrder}`, {
//             responseType: 'blob',
//             observe: 'response'
//         });
//     }
// }



// import { Injectable } from '@angular/core';
// import { HttpClient, HttpResponse } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment.development';
// import { 
//     IOrderResponse, 
//     IOrderRequest,
//     IOrderArrayResponse,
//     IOrderUpdateRequest,
//     IOrderReceiveRequest,
//     IOrderStatusRequest,
//     ISupplierResponse,
//     IProductResponse,
//     IOrderDetail,
//     IProductsBySupplierResponse
// } from '../../shared/models/INewPurchase';

// @Injectable({
//     providedIn: 'root'
// })
// export class NewPurchaseService {
//     private readonly apiUrl = environment.baseUrlApi;

//     constructor(private http: HttpClient) { }

//     getOrders(): Observable<IOrderArrayResponse> {
//         return this.http.get<IOrderArrayResponse>(`${this.apiUrl}/Order/List`);
//     }

//     getOrderById(id: number): Observable<IOrderResponse> {
//         return this.http.get<IOrderResponse>(`${this.apiUrl}/Order/${id}`);
//     }

//     getSuppliers(): Observable<ISupplierResponse> {
//         return this.http.get<ISupplierResponse>(`${this.apiUrl}/Supplier/List`);
//     }

//     getProducts(): Observable<IProductResponse> {
//         return this.http.get<IProductResponse>(`${this.apiUrl}/Product/List`);
//     }

//     getProductsBySupplier(idSupplier: number): Observable<IProductsBySupplierResponse> {
//         return this.http.get<IProductsBySupplierResponse>(`${this.apiUrl}/Product/ProductsBySupplier/${idSupplier}`);
//     }

//     createOrder(order: IOrderRequest): Observable<IOrderResponse> {
//         return this.http.post<IOrderResponse>(`${this.apiUrl}/Order/Add`, order);
//     }

//     updateOrder(id: number, order: IOrderUpdateRequest): Observable<IOrderResponse> {
//         return this.http.put<IOrderResponse>(`${this.apiUrl}/Order/${id}`, order);
//     }

//     updateOrderStatus(id: number, statusRequest: IOrderStatusRequest): Observable<IOrderResponse> {
//         return this.http.put<IOrderResponse>(`${this.apiUrl}/Order/Status/${id}`, statusRequest);
//     }

//     receiveOrder(id: number, receiveRequest: IOrderReceiveRequest): Observable<IOrderResponse> {
//         return this.http.post<IOrderResponse>(`${this.apiUrl}/Order/Receive/${id}`, receiveRequest);
//     }

//     generatePdf(idOrder: number): Observable<HttpResponse<Blob>> {
//         return this.http.get(`${this.apiUrl}/Order/PDForder/${idOrder}`, {
//             responseType: 'blob',
//             observe: 'response'
//         });
//     }
// }





// import { Injectable } from '@angular/core';
// import { HttpClient, HttpResponse } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment.development';
// import { 
//     IOrderResponse, 
//     IOrderRequest,
//     IOrderArrayResponse,
//     IOrderUpdateRequest,
//     IOrderReceiveRequest,
//     IOrderStatusRequest,
//     ISupplierResponse,
//     IProductResponse,
//     IOrderDetail
// } from '../../shared/models/INewPurchase';

// @Injectable({
//     providedIn: 'root'
// })
// export class NewPurchaseService {
//     private readonly apiUrl = environment.baseUrlApi;

//     constructor(private http: HttpClient) { }

//     getOrders(): Observable<IOrderArrayResponse> {
//         return this.http.get<IOrderArrayResponse>(`${this.apiUrl}/Order/List`);
//     }

//     getOrderById(id: number): Observable<IOrderResponse> {
//         return this.http.get<IOrderResponse>(`${this.apiUrl}/Order/${id}`);
//     }

//     getSuppliers(): Observable<ISupplierResponse> {
//         return this.http.get<ISupplierResponse>(`${this.apiUrl}/Supplier/List`);
//     }

//     getProducts(): Observable<IProductResponse> {
//         return this.http.get<IProductResponse>(`${this.apiUrl}/Product/List`);
//     }

//     createOrder(order: IOrderRequest): Observable<IOrderResponse> {
//         return this.http.post<IOrderResponse>(`${this.apiUrl}/Order/Add`, order);
//     }

//     updateOrder(id: number, order: IOrderUpdateRequest): Observable<IOrderResponse> {
//         return this.http.put<IOrderResponse>(`${this.apiUrl}/Order/${id}`, order);
//     }

//     updateOrderStatus(id: number, statusRequest: IOrderStatusRequest): Observable<IOrderResponse> {
//         return this.http.put<IOrderResponse>(`${this.apiUrl}/Order/Status/${id}`, statusRequest);
//     }

//     receiveOrder(id: number, receiveRequest: IOrderReceiveRequest): Observable<IOrderResponse> {
//         return this.http.post<IOrderResponse>(`${this.apiUrl}/Order/Receive/${id}`, receiveRequest);
//     }

//     generatePdf(idOrder: number): Observable<HttpResponse<Blob>> {
//         return this.http.get(`${this.apiUrl}/Order/PDForder/${idOrder}`, {
//             responseType: 'blob',
//             observe: 'response'
//         });
//     }
// }