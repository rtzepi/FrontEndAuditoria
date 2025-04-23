export interface IImage {
  idImg: number;
  mimeType: string;
  data: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number | null;
}

export interface ICompany {
  idCompany: number;
  companyName: string;
  phoneNumber: string;
  address: string;
  idLogo: number;
  image?: IImage | null;
  imgBase64: string | null;
  email: string;
  nit: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number | null;
}

export interface ICompanySingleResponse {
  isSuccess: boolean;
  value: ICompany | null;
  error?: string | null;
  message?: string;
}
