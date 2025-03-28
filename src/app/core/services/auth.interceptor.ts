// src/app/core/interceptors/auth.interceptor.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
HttpInterceptor,
HttpRequest,
HttpHandler,
HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable()
export class authInterceptor implements HttpInterceptor {
constructor(
    private localStorageS: LocalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
) {}

intercept(
    request: HttpRequest<any>,
    next: HttpHandler
): Observable<HttpEvent<any>> {
    // Clonar la solicitud y agregar el token solo en el cliente
    const modifiedReq = isPlatformBrowser(this.platformId) 
    ? this.addTokenToRequest(request)
    : request;

    return next.handle(modifiedReq);
}

private addTokenToRequest(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.localStorageS.get('token');
    if (token) {
    try {
        const parsedToken = JSON.parse(token);
        return request.clone({
        setHeaders: {
            Authorization: `Bearer ${parsedToken}`
        }
        });
    } catch (e) {
        console.error('Error parsing token:', e);
    }
    }
    return request;
}
}