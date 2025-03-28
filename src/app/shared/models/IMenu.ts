export interface IMenu {
    idMenu?: number;
    nameMenu: string;
    icon: string;
    idMenuFather: number | null;
    menuFather?: string | null;
    route: string;
    status: string;
    order?: number;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    deleted_at?: string | null;
}

export interface IMenuResponse {
    isSuccess: boolean;
    value: IMenu[] | IMenu | null;
    error?: string | null;
    message?: string;
}








// export interface IMenu {
//     idMenu?: number;
//     nameMenu: string;
//     icon: string;
//     idMenuFather: number | null;
//     menuFather?: string | null;
//     route: string;
//     status: string;
//     order?: number;
//     created_at?: string;
//     updated_at?: string;
//     created_by?: number;
//     deleted_at?: string | null;
// }

// export interface IMenuResponse {
//     isSuccess: boolean;
//     value: IMenu[] | IMenu | null;
//     error?: string | null;
//     message?: string;
// }


// export interface IMenu {
//     idMenu?: number;
//     nameMenu: string;
//     icon: string;
//     idMenuFather: number | null;
//     menuFather?: string | null;
//     route: string;
//     status: string;
//     order?: number;
//     created_at?: string;
//     updated_at?: string;
//     created_by?: number;
//     deleted_at?: string | null;
// }

// export interface IMenuResponse {
//     isSuccess: boolean;
//     value: IMenu[] | IMenu | null;
//     error?: string | null;
//     message?: string;
// }