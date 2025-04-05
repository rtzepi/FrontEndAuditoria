export interface IProductImage {
    idImg: number;
    mimeType: string;
    data: string;
    created_at: string;
    updated_at: string;
    created_by: number;
    deleted_at: string | null;
}

export interface ICategory {
    idCategory: number;
    categoryName: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    created_by: number;
    deleted_at: string | null;
}

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

export interface IUnitOfSale {
    idUnitOfSale: number;
    unityName: string;
    abbreviation: string;
    description: string;
    status: string;
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
    dateExpire: string | null;
    idImage: number; 
    image?: IProduct | null;
    imgBase64: string | null;
    idCategory: number; 
    category: ICategory | null;
    idSupplier: number; 
    supplier: ISupplier | null;
    idUnitOfSale: number | null;
    unitOfSale: IUnitOfSale | null;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    deleted_at?: string | null;
    picture?: string;
}

export interface IProductSingleResponse {
    isSuccess: boolean;
    value: IProduct | null;
    error?: string | null;
    message?: string;
}

export interface IProductArrayResponse {
    isSuccess: boolean;
    value: IProduct[];
    error?: string | null;
    message?: string;
}

export interface ICategoryArrayResponse {
    isSuccess: boolean;
    value: ICategory[];
    error?: string | null;
    message?: string;
}

export interface ISupplierArrayResponse {
    isSuccess: boolean;
    value: ISupplier[];
    error?: string | null;
    message?: string;
}

export interface IUnitOfSaleArrayResponse {
    isSuccess: boolean;
    value: IUnitOfSale[];
    error?: string | null;
    message?: string;
}