export interface ITableAudit {
    schemaName: string;
    tableName: string;
    auditar: boolean;
    triggerExists: number;
}

export interface ITableAuditStatus {
    schemaName: string;
    tableName: string;
    auditar: boolean;
    triggerExists: number;
}

export interface ITableAuditSetRequest {
    schemaName: string;
    tableName: string;
    auditar: boolean;
}

export interface ITableAuditSingleResponse {
    isSuccess: boolean;
    value: ITableAudit | null;
    error?: string | null;
    message?: string;
}

export interface ITableAuditArrayResponse {
    isSuccess: boolean;
    value: ITableAuditStatus[];
    error?: string | null;
    message?: string;
}