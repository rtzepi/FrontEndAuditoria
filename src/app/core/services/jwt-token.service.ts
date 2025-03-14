import { inject, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { LocalStorageService } from './local-storage.service';

@Injectable({
providedIn: 'root'
})
export class JwtTokenService {
localStorage = inject(LocalStorageService)
jwtToken: string | null = null;
decodedToken?: { [key: string]: any } | null;



constructor() {
    this.loadToken();
}

loadToken() {
    const token = localStorage.getItem('currentuser');
    if (token) {
    this.setToken(token);
    }
}

setToken(token: string | null) {
    if (token) {
    this.jwtToken = token;
    this.decodeToken();
    } else {
    this.jwtToken = null;
    this.decodedToken = null;
    }
}








decodeToken() {
    if (this.jwtToken) {
    this.decodedToken = jwtDecode(this.jwtToken);
    }
}

getDecodeToken() {
    return this.jwtToken ? jwtDecode(this.jwtToken) : null;
}

getId() {
    this.decodeToken();
    return this.decodedToken ? this.decodedToken['nameid'] : null;
}

getUser() {
    this.decodeToken();
    return this.decodedToken ? this.decodedToken['displayname'] : null;
}

getRole() {
    this.decodeToken();
    return this.decodedToken ? this.decodedToken['role'] : null;
}

getExpiryTime() {
    this.decodeToken();
    return this.decodedToken ? this.decodedToken['exp'] : null;
}


isTokenExpired(): boolean {
    const token = localStorage.getItem('currentuser');
    if (!token) {
    return true;
    }

    this.setToken(token);
    const expiryTime: number = this.getExpiryTime();
    return expiryTime ? ((1000 * expiryTime) - (new Date()).getTime()) < 5000 : true;
}

}
