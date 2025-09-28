export interface IUser {
    idUser: number;
    userName: string;
    status: string;
    isChangePass: boolean;
    lastLogin: string | null;
    MFAEnabled: boolean;
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

export interface IResetPasswordResponse {
    isSuccess: boolean;
    message?: string;
    error?: string | null;
    totpSecret?: string;
    qrCodeImageBase64?: string;
}

export interface ILoginResponse {
    requiresMFA?: boolean;
    userId?: number;
    token?: string;
    isFirstLogin?: boolean;
}

export interface IMFAVerificationRequest {
    userId: number;
    code: string;
}

export interface IPasswordResetRequest {
    email: string;
}

export interface IValidateTokenRequest {
    token: string;
}

export interface IResetPasswordWithTokenRequest {
    token: string;
    newPassword: string;
}

export interface IResetPasswordRequest {
    idUser: number;
}

// Nueva interfaz para la respuesta MFA
export interface IMFASetupResponse {
    message: string;
    totpSecret: string;
    qrCodeImageBase64: string;
    otpauthUrl: string;
}

// Interfaz para olvidar contraseña
export interface IForgetPasswordRequest {
    email: string;
}




// export interface IUser {
//     idUser: number;
//     userName: string;
//     status: string;
//     isChangePass: boolean;
//     lastLogin: string | null;
//     MFAEnabled: boolean;
//     idEmployee: number;
//     idRole: number;
//     picture: string | null;
//     email: string;
//     created_at?: string;
//     updated_at?: string;
//     created_by?: number;
//     deleted_at?: string | null;
// }

// export interface IEmployee {
//     idEmployee: number;
//     firstName: string;
//     middleName?: string | null;
//     fatherLastName: string;
//     motherLastName?: string | null;
//     status: string;
//     email: string;
//     phoneNumber: string;
//     picture?: string | null;
//     idPicture?: number | null;
// }

// export interface IRole {
//     idRole: number;
//     roleName: string;
//     description?: string;
//     status: string;
//     isNotify?: boolean;
// }

// export interface IUserResponse {
//     isSuccess: boolean;
//     value: IUser | IUser[];
//     error?: string | null;
//     message?: string;
// }

// export interface IResetPasswordResponse {
//     isSuccess: boolean;
//     message?: string;
//     error?: string | null;
//     totpSecret?: string;
//     qrCodeImageBase64?: string;
// }

// export interface ILoginResponse {
//     requiresMFA?: boolean;
//     userId?: number;
//     token?: string;
//     isFirstLogin?: boolean;
// }

// export interface IMFAVerificationRequest {
//     userId: number;
//     code: string;
// }

// export interface IPasswordResetRequest {
//     email: string;
// }

// export interface IValidateTokenRequest {
//     token: string;
// }

// export interface IResetPasswordWithTokenRequest {
//     token: string;
//     newPassword: string;
// }

// export interface IResetPasswordRequest {
//     idUser: number;
// }

// // Nueva interfaz para la respuesta MFA
// export interface IMFASetupResponse {
//     message: string;
//     totpSecret: string;
//     qrCodeImageBase64: string;
//     otpauthUrl: string;
// }

// // Nueva interfaz para forget-password
// export interface IForgetPasswordRequest {
//     email: string;
// }




// export interface IUser {
//     idUser: number;
//     userName: string;
//     status: string;
//     isChangePass: boolean;
//     lastLogin: string | null;
//     MFAEnabled: boolean;
//     idEmployee: number;
//     idRole: number;
//     picture: string | null;
//     email: string;
//     created_at?: string;
//     updated_at?: string;
//     created_by?: number;
//     deleted_at?: string | null;
// }

// export interface IEmployee {
//     idEmployee: number;
//     firstName: string;
//     middleName?: string | null;
//     fatherLastName: string;
//     motherLastName?: string | null;
//     status: string;
//     email: string;
//     phoneNumber: string;
//     picture?: string | null;
//     idPicture?: number | null;
// }

// export interface IRole {
//     idRole: number;
//     roleName: string;
//     description?: string;
//     status: string;
//     isNotify?: boolean;
// }

// export interface IUserResponse {
//     isSuccess: boolean;
//     value: IUser | IUser[];
//     error?: string | null;
//     message?: string;
// }

// export interface IResetPasswordResponse {
//     isSuccess: boolean;
//     message?: string;
//     error?: string | null;
//     totpSecret?: string;
//     qrCodeImageBase64?: string;
// }

// export interface ILoginResponse {
//     requiresMFA?: boolean;
//     userId?: number;
//     token?: string;
//     isFirstLogin?: boolean;
// }

// export interface IMFAVerificationRequest {
//     userId: number;
//     code: string;
// }

// export interface IPasswordResetRequest {
//     email: string;
// }

// export interface IValidateTokenRequest {
//     token: string;
// }

// export interface IResetPasswordWithTokenRequest {
//     token: string;
//     newPassword: string;
// }

// export interface IResetPasswordRequest {
//     idUser: number;
// }

// // Nueva interfaz para la respuesta MFA
// export interface IMFASetupResponse {
//     message: string;
//     totpSecret: string;
//     qrCodeImageBase64: string;
//     otpauthUrl: string;
// }








// export interface IUser {
//     idUser: number;
//     userName: string;
//     status: string;
//     isChangePass: boolean;
//     lastLogin: string | null;
//     MFAEnabled: boolean;
//     idEmployee: number;
//     idRole: number;
//     picture: string | null;
//     email: string;
//     created_at?: string;
//     updated_at?: string;
//     created_by?: number;
//     deleted_at?: string | null;
// }

// export interface IEmployee {
//     idEmployee: number;
//     firstName: string;
//     middleName?: string | null;
//     fatherLastName: string;
//     motherLastName?: string | null;
//     status: string;
//     email: string;
//     phoneNumber: string;
//     picture?: string | null;
//     idPicture?: number | null;
// }

// export interface IRole {
//     idRole: number;
//     roleName: string;
//     description?: string;
//     status: string;
//     isNotify?: boolean;
// }

// export interface IUserResponse {
//     isSuccess: boolean;
//     value: IUser | IUser[];
//     error?: string | null;
//     message?: string;
// }

// export interface IResetPasswordResponse {
//     isSuccess: boolean;
//     message?: string;
//     error?: string | null;
//     totpSecret?: string;
//     qrCodeImageBase64?: string;
// }

// export interface ILoginResponse {
//     requiresMFA?: boolean;
//     userId?: number;
//     token?: string;
//     isFirstLogin?: boolean;
// }

// export interface IMFAVerificationRequest {
//     userId: number;
//     code: string;
// }

// export interface IPasswordResetRequest {
//     email: string;
// }

// export interface IValidateTokenRequest {
//     token: string;
// }

// export interface IResetPasswordWithTokenRequest {
//     token: string;
//     newPassword: string;
// }

// export interface IResetPasswordRequest {
//     idUser: number;
// }

// // Nueva interfaz para la respuesta MFA
// export interface IMFASetupResponse {
//     message: string;
//     totpSecret: string;
//     qrCodeImageBase64: string;
//     otpauthUrl: string;
// }

// export interface IUser {
//     idUser: number;
//     userName: string;
//     status: string;
//     isChangePass: boolean;
//     lastLogin: string | null;
//     MFAEnabled: boolean;
//     idEmployee: number;
//     idRole: number;
//     picture: string | null;
//     email: string;
//     created_at?: string;
//     updated_at?: string;
//     created_by?: number;
//     deleted_at?: string | null;
// }

// export interface IEmployee {
//     idEmployee: number;
//     firstName: string;
//     middleName?: string | null;
//     fatherLastName: string;
//     motherLastName?: string | null;
//     status: string;
//     email: string;
//     phoneNumber: string;
//     picture?: string | null;
//     idPicture?: number | null;
// }

// export interface IRole {
//     idRole: number;
//     roleName: string;
//     description?: string;
//     status: string;
//     isNotify?: boolean;
// }

// export interface IUserResponse {
//     isSuccess: boolean;
//     value: IUser | IUser[];
//     error?: string | null;
//     message?: string;
// }

// export interface IResetPasswordResponse {
//     isSuccess: boolean;
//     message?: string;
//     error?: string | null;
//     totpSecret?: string;
//     qrCodeImageBase64?: string;
// }

// export interface ILoginResponse {
//     requiresMFA?: boolean;
//     userId?: number;
//     token?: string;
//     isFirstLogin?: boolean;
// }

// export interface IMFAVerificationRequest {
//     userId: number;
//     code: string;
// }

// export interface IPasswordResetRequest {
//     email: string;
// }

// export interface IValidateTokenRequest {
//     token: string;
// }

// export interface IResetPasswordWithTokenRequest {
//     token: string;
//     newPassword: string;
// }

// export interface IResetPasswordRequest {
//     idUser: number;
// }

// // Nueva interfaz para la respuesta MFA
// export interface IMFASetupResponse {
//     message: string;
//     totpSecret: string;
//     qrCodeImageBase64: string;
//     otpauthUrl: string;
// }



// export interface IUser {
//     idUser: number;
//     userName: string;
//     status: string;
//     isChangePass: boolean;
//     lastLogin: string | null;
//     MFAEnabled: boolean;
//     idEmployee: number;
//     idRole: number;
//     picture: string | null;
//     email: string;
//     created_at?: string;
//     updated_at?: string;
//     created_by?: number;
//     deleted_at?: string | null;
// }

// export interface IEmployee {
//     idEmployee: number;
//     firstName: string;
//     middleName?: string | null;
//     fatherLastName: string;
//     motherLastName?: string | null;
//     status: string;
//     email: string;
//     phoneNumber: string;
//     picture?: string | null;
//     idPicture?: number | null;
// }

// export interface IRole {
//     idRole: number;
//     roleName: string;
//     description?: string;
//     status: string;
//     isNotify?: boolean;
// }

// export interface IUserResponse {
//     isSuccess: boolean;
//     value: IUser | IUser[];
//     error?: string | null;
//     message?: string;
// }

// export interface IResetPasswordResponse {
//     isSuccess: boolean;
//     message?: string;
//     error?: string | null;
// }

// export interface ILoginResponse {
//     requiresMFA?: boolean;
//     userId?: number;
//     token?: string;
//     isFirstLogin?: boolean;
// }

// export interface IMFAVerificationRequest {
//     userId: number;
//     code: string;
// }

// export interface IPasswordResetRequest {
//     email: string;
// }

// export interface IValidateTokenRequest {
//     token: string;
// }

// export interface IResetPasswordWithTokenRequest {
//     token: string;
//     newPassword: string;
// }

// // Nueva interfaz para el endpoint reset-password
// export interface IResetPasswordRequest {
//     idUser: number;
// }

// export interface ISetPasswordResponse {
//     isSuccess: boolean;
//     value: {
//         message: string;
//         totpSecret: string;
//         qrCodeImageBase64: string;
//         otpauthUrl: string;
//     };
//     error?: string | null;
// }