export interface ICashSession {
    idCashSession: number;
    openingAmount: number;
    openingDate: string;
    closingDate: string | null;
    closingAmount: number | null;
    replenishedAmount: number | null;
    observation: string | null;
    status: 'A' | 'C';
    idEmployee: number;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    deleted_at?: string | null;
    employeeName?: string;
}

export interface ICashSessionCloseRequest {
    closingAmount: number;
    replenishedAmount: number;
    observation: string;
}

export interface ICashTransaction {
    idTransaction: number;
    transactionType: string;
    amount: number;
    description: string;
    transactionDate: string;
    referenceNumber?: string;
    idCashSession: number;
}

export interface ICashSessionResponse {
    isSuccess: boolean;
    value: ICashSession | null;
    error?: string | null;
    message?: string;
}

export interface ICashTransactionListResponse {
    isSuccess: boolean;
    value: ICashTransaction[] | null;
    error?: string | null;
    message?: string;
}

export interface ICashSessionSummary {
    totalSales: number;
    totalExpenses: number;
    expectedAmount: number;
    difference: number;
}