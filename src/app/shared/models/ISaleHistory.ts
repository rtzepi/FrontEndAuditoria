export interface ISale {
    idSale: number;
    saleDate: string;
    typePayment: string;
    observation: string;
    discountTotal: number;
    subTotal: number;
    total: number;
    amountReceive: number;
    amountGive: number;
    user: string;
}

export interface ISaleDetail {
    idSale: number;
    idProduct: number;
    idSaleDetail: number;
    quantity: number;
    unitPrice: number;
    discount: number;
    subTotal: number;
    total: number;
    productName?: string;
}

export interface ISaleFull {
    idSale: number;
    saleDate: string;
    typePayment: string;
    observation: string;
    amountGive: number;
    amountReceive: number;
    discountTotal: number;
    subTotal: number;
    total: number;
    sales: ISaleDetail[];
    user: string;
}

export interface ISaleResponse {
    isSuccess: boolean;
    value: ISale[];
    error?: string | null;
}

export interface ISaleDetailResponse {
    isSuccess: boolean;
    value: ISaleFull;
    error?: string | null;
}