import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { LocalStorageService } from '../services/local-storage.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorageService = inject(LocalStorageService)
  const authService = inject(AuthService)
  const currentUser = localStorageService.get('token');

  const cloneReq = currentUser
    ? req.clone({
      setHeaders: {

        Authorization: `Bearer ${currentUser}`
      }
    })
    : req;



  return next(cloneReq).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          authService.logout()
        }
      }
      return throwError(() => err)
    })
  )
};
