import { Injectable } from '@angular/core';

@Injectable({
providedIn: 'root',
})
export class LocalStorageService {
constructor() {}

  // Método para guardar un valor en el localStorage
set(key: string, value: string): void {
    localStorage.setItem(key, value);
}

  // Método para obtener un valor del localStorage
get(key: string): string | null {
    return localStorage.getItem(key);
}

  // Método para eliminar un valor del localStorage
remove(key: string): void {
    localStorage.removeItem(key);
}

  // Método para limpiar todo el localStorage
clear(): void {
    localStorage.clear();
}
}