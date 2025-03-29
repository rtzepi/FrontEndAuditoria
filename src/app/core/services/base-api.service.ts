import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable({
providedIn: 'root'
})
export class BaseApiService {

baseApi: string = environment.baseUrlApi;

constructor(private http: HttpClient) { }

}
