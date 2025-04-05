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

export interface IUnitOfSaleResponse {
    isSuccess: boolean;
    value: IUnitOfSale | IUnitOfSale[];
    error?: string | null;
    message?: string;
}