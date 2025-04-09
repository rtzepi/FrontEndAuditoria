export interface IProfile {
    picture?: string;
    idEmployee?: number;
    firstName?: string;
    fatherLastName?: string;
    middleName?: string;
    motherLastName?: string;
    roleName?: string;
    idRole?: number;
    idPicture?: number;
    email?: string;
    phoneNumber?: string;
    status?: string;
    notifyList?: any[];
}

export interface IProfileResponse {
    isSuccess: boolean;
    value: IProfile | null;
    error?: string | null;
}