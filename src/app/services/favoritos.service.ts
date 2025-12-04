import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FavoritoResponse {
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class FavoritosService {
    private apiUrl = 'http://localhost:8080/api/Favoritos';
    //private apiUrl = 'https://concludingly-unfeigning-lacresha.ngrok-free.dev/api/Favoritos';

    constructor(private http: HttpClient) { }

    agregarEquipo(equipoId: string, usuarioId: string): Observable<FavoritoResponse> {
        const url = `${this.apiUrl}/equipos/${equipoId}/${usuarioId}`;
        return this.http.post<FavoritoResponse>(url, {});
    }

    eliminarEquipo(equipoId: string, usuarioId: string): Observable<FavoritoResponse> {
        const url = `${this.apiUrl}/equipos/${equipoId}/${usuarioId}`;
        return this.http.delete<FavoritoResponse>(url);
    }

    agregarPartido(partidoId: string, usuarioId: string): Observable<FavoritoResponse> {
        const url = `${this.apiUrl}/partidos/${partidoId}/${usuarioId}`;
        return this.http.post<FavoritoResponse>(url, {});
    }

    eliminarPartido(partidoId: string, usuarioId: string): Observable<FavoritoResponse> {
        const url = `${this.apiUrl}/partidos/${partidoId}/${usuarioId}`;
        return this.http.delete<FavoritoResponse>(url);
    }
}