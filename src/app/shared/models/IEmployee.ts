export interface IEmployeeImage {
    idImg: number;
    mimeType: string;
    data: string;
    created_at: string;
    updated_at: string;
    created_by: number;
    deleted_at: string | null;
}

export interface IEmployee {
    idEmployee: number;  // Cambiado a requerido
    firstName: string;
    middleName: string | null;
    fatherLastName: string;
    motherLastName: string | null;
    status: string;
    email: string;
    phoneNumber: string;
    imgBase64: string | null;
    idPicture: number | null;
    isAuthorization: boolean;
    image?: IEmployeeImage | null;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    deleted_at?: string | null;
}

export interface IEmployeeSingleResponse {
    isSuccess: boolean;
    value: IEmployee | null;
    error?: string | null;
    message?: string;
}

export interface IEmployeeArrayResponse {
    isSuccess: boolean;
    value: IEmployee[];
    error?: string | null;
    message?: string;
}
