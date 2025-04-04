export interface IProduct {
    idProduct: number;
    nameProduct: string;
    description: string;
    status: string;
    isExpire: boolean;
    dateExpire: string;
    idImage: number;
    image: IImage;
    imgBase64: string;
    idCategory: number;
    category: ICategory;
    idSupplier: number;
    supplier: ISupplier;
    idUnitOfSale?: number;
    unitOfSale?: IUnitOfSale;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    deleted_at?: string | null;
}

export interface IImage {
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
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    deleted_at?: string | null;
}

export interface IProductResponse {
    isSuccess: boolean;
    value: IProduct | IProduct[];
    error?: string | null;
    message?: string;
}





// export interface IProduct {
//     idProduct: number;
//     nameProduct: string;
//     description: string;
//     status: string;
//     isExpire: boolean;
//     dateExpire: string;
//     idImage: number;
//     image: IImage;
//     imgBase64: string;
//     idCategory: number;
//     category: ICategory;
//     idSupplier: number;
//     supplier: ISupplier;
//     created_at?: string;
//     updated_at?: string;
//     created_by?: number;
//     deleted_at?: string | null;
// }

// export interface IImage {
//     idImg: number;
//     mimeType: string;
//     data: string;
//     created_at: string;
//     updated_at: string;
//     created_by: number;
//     deleted_at: string | null;
// }

// export interface ICategory {
//     idCategory: number;
//     categoryName: string;
//     description: string;
//     status: string;
//     created_at: string;
//     updated_at: string;
//     created_by: number;
//     deleted_at: string | null;
// }

// export interface ISupplier {
//     idSupplier: number;
//     nameSupplier: string;
//     nameContact: string;
//     phoneNumber: string;
//     phoneNumberContact: string;
//     email: string;
//     address: string;
//     status: string;
//     observation: string;
//     created_at: string;
//     updated_at: string;
//     created_by: number;
//     deleted_at: string | null;
// }

// export interface IProductResponse {
//     isSuccess: boolean;
//     value: IProduct | IProduct[];
//     error?: string | null;
//     message?: string;
// }