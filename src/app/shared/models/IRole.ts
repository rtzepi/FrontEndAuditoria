export interface IRole {
    idRole: number;
    roleName: string;
    description?: string;
    status: string;
    isNotify?: boolean;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    deleted_at?: string | null;
}

export interface IRoleResponse {
    isSuccess: boolean;
    value: IRole | IRole[];
    error?: string | null;
    message?: string;
}

export interface IRoleRegisterRequest {
    roleName: string;
    description?: string;
    status: string;
    isNotify?: boolean;
}

export interface IRoleUpdateRequest extends IRoleRegisterRequest {
    idRole: number;
}