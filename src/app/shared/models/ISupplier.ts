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

export interface ISupplierSingleResponse {
    isSuccess: boolean;
    value: ISupplier | null;
    error?: string | null;
    message?: string;
}

export interface ISupplierArrayResponse {
    isSuccess: boolean;
    value: ISupplier[];
    error?: string | null;
    message?: string;
}