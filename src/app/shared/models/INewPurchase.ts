export interface IOrder {
    idOrder: number;
    idSupplier: number;
    products: IOrderDetail[];
    status: string;
    description: string;
    created_at?: string;
}

export interface IOrderDetail {
    idOrderDetail: number;
    idProduct: number;
    priceBuy: number;
    quantity: number;
    idOrder: number;
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
    dateAdded?: string;
}

export interface ILowStockProduct {
    idProduct: number;
    nameProduct: string;
    currentStock: number;
    minStock: number;
}