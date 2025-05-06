import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface CashSession {
    idCashSession: number;
    openDate: string;
    closeDate: string | null;
    userOpen: number;
    userClose: number | null;
    openingAmount: number;
    closingAmount: number | null;
    expectedClosingAmount: number | null;
    differenceAmount: number | null;
    replenishedAmount: number | null;
    observation: string | null;
    isClosed: boolean;
    resolutionMethod: string;
}

export interface DailyTransaction {
    idDailyTransaction: number;
    idCashSession: number;
    trnType: string;
    amount: number;
    description: string;
    transactionDate: string;
}

export interface CashSessionOpenRequest {
    openingAmount: number;
}

export interface CashSessionCloseRequest {
    closingAmount: number;
    replenishedAmount: number;
    observation: string;
}

export interface Response<T> {
    isSuccess: boolean;
    value?: T;
    error?: string;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CashService {
    private readonly apiUrl = `${environment.baseUrlApi}/CashSession`;

    constructor(private http: HttpClient) { }

    openCashSession(request: CashSessionOpenRequest): Observable<Response<CashSession>> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.post<Response<CashSession>>(`${this.apiUrl}/Active`, request, { headers });
    }

    closeCashSession(request: CashSessionCloseRequest): Observable<Response<CashSession>> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.put<Response<CashSession>>(`${this.apiUrl}/Close`, request, { headers });
    }

    getTransactionList(): Observable<Response<DailyTransaction[]>> {
        return this.http.get<Response<DailyTransaction[]>>(`${this.apiUrl}/trnsList`);
    }
    
    checkActiveSession(): Observable<Response<CashSession>> {
        return this.http.get<Response<CashSession>>(`${this.apiUrl}/CheckActive`);
    }
}