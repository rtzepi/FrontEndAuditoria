export interface IProduct {
    idProduct: number;
    nameProduct: string;
    description: string;
    totalStock: number;
    priceBuy: number;
    salePrice: number;
    imageBase64?: string;
    imgBase64?: string;
    idCategory?: number;
    status?: string;
    isExpire?: boolean;
    idImage?: number;
    idSupplier?: number;
    created_at?: string;
    stockMin?: number;
    code?: string | null;
}

export interface IProductResponse {
    isSuccess: boolean;
    value: IProduct[];
    error?: string;
}

export interface IProductNameResponse {
    isSuccess: boolean;
    value: string[];
    error?: string;
}

export interface ICategory {
    idCategory: number;
    categoryName: string;
    description: string;
    created_at: string;
    status: string;
}

export interface ICategoryResponse {
    isSuccess: boolean;
    value: ICategory[];
    error?: string | null;
}

export interface ISaleDetail {
    idSaleDetail?: number;
    idProduct: number;
    quantity: number;
    discount: number;
    unitPrice: number;
    productName?: string;
    subtotal?: number;
    total?: number;
}

export interface ISale {
    observation?: string;
    amountReceive: number;
    amountGive: number;
    products: ISaleDetail[];
}

export interface ISaleResponse {
    isSuccess: boolean;
    value: {
        idSale: number;
        saleDate: string;
        totalAmount: number;
    };
    error?: string;
}

export interface ICartItem {
    idProduct: number;
    name: string;
    price: number;
    quantity: number;
    discount: number;
    subtotal: number;
    total: number;
    image?: string;
    stock: number;
}