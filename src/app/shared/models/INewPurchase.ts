export interface ISupplier {
    idSupplier: number;
    nameSupplier: string;
    nameContact: string;
    phoneNumber: string;
    phoneNumberContact: string;
    email: string;
    address: string;
    status: string;
    observation: string;
    created_at: string;
    updated_at: string;
    created_by: number;
    deleted_at: string | null;
}

export interface IProduct {
    idProduct: number;
    nameProduct: string;
    description: string | null;
    status: string;
    isExpire: boolean;
    stockMin: number;
    dateExpire: string | null;
    idSupplier: number | null;
    supplier: ISupplier | null;
    priceBuy?: number; 
    salePrice?: number;
}

export interface IOrder {
    idOrder: number;
    dateOrder: string;
    description: string;
    status: string;
    totalAmount: number;
    idSupplier: number;
    created_at?: string;
    updated_at?: string | null;
    created_by?: number;
    products?: IOrderDetail[];
    supplier?: ISupplier;
}

export interface IOrderDetail {
    idOrderDetail: number;
    idProduct: number;
    quantity: number;
    priceBuy: number;
    subtotal: number;
    idOrder: number;
    created_at?: string;
    productName?: string;
    isExpire?: boolean;
    stockMin?: number;
    productDescription?: string | null;
    status?: string;
    observation?: string | null;
    salePrice?: number;
    expireProduct?: string | null;
}

export interface IOrderRequest {
    idSupplier: number;
    products: {
        idProduct: number;
        quantity: number;
        priceBuy: number;
    }[];
    status: string;
    description: string;
    totalAmount?: number;
}

export interface IOrderUpdateRequest {
    idSupplier: number;
    products: {
        idOrderDetail?: number;
        idProduct: number;
        priceBuy: number;
        quantity: number;
        idOrder: number;
    }[];
    status: string;
    description: string;
    totalAmount?: number;
}

export interface IOrderReceiveRequest {
    description?: string;
    products: {
        idOrderDetail: number;
        idProduct: number;
        priceBuy: number;
        salePrice: number;
        quantity: number;
        idOrder: number;
        expireProduct?: string | null;
        observation?: string | null;
    }[];
}

export interface IOrderStatusRequest {
    status: string;
    description?: string;
}

export interface IOrderResponse {
    isSuccess: boolean;
    value: IOrder | null;
    error?: string | null;
}

export interface IOrderArrayResponse {
    isSuccess: boolean;
    value: IOrder[];
    error?: string | null;
}

export interface IProductOrder {
    idProduct: number;
    nameProduct: string;
    quantity: number;
    priceBuy: number;
    salePrice: number;
    idOrderDetail?: number;
    subtotal?: number;
    isExpire?: boolean;
    stockMin?: number;
    productDescription?: string | null;
    observation?: string | null;
    status?: string;
    expireProduct?: string | null;
}

export interface ILowStockProduct {
    idProduct: number;
    nameProduct: string;
    currentStock: number;
    minStock: number;
}

export interface ISupplierResponse {
    isSuccess: boolean;
    value: ISupplier | ISupplier[];
    error?: string | null;
}

export interface IProductResponse {
    isSuccess: boolean;
    value: IProduct | IProduct[];
    error?: string | null;
}