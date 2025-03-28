export interface IUser {
    idUser: number;
    userName: string;
    status: string;
    isChangePass: boolean;
    lastLogin: string | null;
    idEmployee: number;
    idRole: number;
    picture: string | null;
    email: string;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    deleted_at?: string | null;
}




export interface IEmployee {
    idEmployee: number;
    firstName: string;
    middleName?: string | null;
    fatherLastName: string;
    motherLastName?: string | null;
    status: string;
    email: string;
    phoneNumber: string;
    picture?: string | null;
    idPicture?: number | null;
}

export interface IRole {
    idRole: number;
    roleName: string;
    description?: string;
    status: string;
    isNotify?: boolean;
}

export interface IUserResponse {
    isSuccess: boolean;
    value: IUser | IUser[];
    error?: string | null;
    message?: string;
}


// export interface IUser {
//     idUser: number;
//     userName: string;
//     status: string;
//     isChangePass: boolean;
//     lastLogin: string;
//     idEmployee: number;
//     idRole: number;
//     email: string;
//     created_at?: string;
//     updated_at?: string;
//     created_by?: number;
//     deleted_at?: string | null;
// }

// export interface IUserResponse {
//     isSuccess: boolean;
//     value: IUser | IUser[];
//     error?: string | null;
//     message?: string;
// }

// export interface IUserRegisterRequest {
//     idEmployee: number;
//     idRole: number;
//     status: string;
//     isChangePass: boolean;
// }

// export interface IUserUpdateRequest extends IUserRegisterRequest {
//     idUser: number;
//     userName?: string;
// }


// export interface IUser {
//     idUser: number;
//     userName: string;
//     password?: string;
//     status: string;
//     isChangePass: boolean;
//     lastLogin: string;
//     idEmployee: number;
//     idRole: number;
//     picture: string;
//     email: string;
// }

// export interface IUserResponse {
//     isSuccess: boolean;
//     value: IUser | IUser[];
//     error?: string | null;
//     message?: string;
// }

// export interface IUserRegisterRequest {
//     userName: string;
//     password: string;
//     status: string;
//     isChangePass: boolean;
//     idEmployee: number;
//     idRole: number;
//     picture: string;
// }