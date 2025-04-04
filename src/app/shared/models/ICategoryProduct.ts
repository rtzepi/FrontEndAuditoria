export interface ICategoryProduct {
    idCategory?: number;
    categoryName: string;
    description: string;
    creationDate?: Date | string;
    status: string;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    deleted_at?: string | null;
}

export interface ICategoryProductResponse {
    isSuccess: boolean;
    value: ICategoryProduct[] | ICategoryProduct | null;
    error?: string | null;
    message?: string;
}