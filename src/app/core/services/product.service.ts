import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { 
    IProduct, 
    IProductSingleResponse, 
    IProductArrayResponse,
    ICategoryArrayResponse,
    ISupplierArrayResponse,
    IUnitOfSaleArrayResponse
} from '../../shared/models/IProduct';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly apiUrl = `${environment.baseUrlApi}/Product`;

    constructor(private http: HttpClient) { }

    private prepareProductData(product: IProduct): any {
    return {
        idProduct: product.idProduct,
        nameProduct: product.nameProduct,
        description: product.description || null,
        status: product.status,
        isExpire: product.isExpire,
        dateExpire: product.dateExpire,
        imgBase64: product.imgBase64,
        idImage: product.idImage ? Number(product.idImage) : Number,
        idCategory: product.idCategory ? Number(product.idCategory) : null,
        idSupplier: product.idSupplier ? Number(product.idSupplier) : null, 
        idUnitOfSale: product.idUnitOfSale ? Number(product.idUnitOfSale) : null
    };
}

    getProducts(): Observable<IProductArrayResponse> {
        return this.http.get<IProductArrayResponse>(`${this.apiUrl}/List`);
    }

    addProduct(product: IProduct): Observable<IProductSingleResponse> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const body = this.prepareProductData(product);
        return this.http.post<IProductSingleResponse>(`${this.apiUrl}/Add`, body, { headers });
    }

    updateProduct(id: number, product: IProduct): Observable<IProductSingleResponse> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const body = this.prepareProductData(product);
        return this.http.put<IProductSingleResponse>(`${this.apiUrl}/${id}`, body, { headers });
    }

    deleteProduct(id: number): Observable<IProductSingleResponse> {
        return this.http.delete<IProductSingleResponse>(`${this.apiUrl}`, {
            params: { id: id.toString() }
        });
    }

    getCategories(): Observable<ICategoryArrayResponse> {
        return this.http.get<ICategoryArrayResponse>(`${environment.baseUrlApi}/CategoryProduct/List`);
    }

    getSuppliers(): Observable<ISupplierArrayResponse> {
        return this.http.get<ISupplierArrayResponse>(`${environment.baseUrlApi}/Supplier/List`);
    }

    getUnitsOfSale(): Observable<IUnitOfSaleArrayResponse> {
        return this.http.get<IUnitOfSaleArrayResponse>(`${environment.baseUrlApi}/UnityOfSale/List`);
    }
}