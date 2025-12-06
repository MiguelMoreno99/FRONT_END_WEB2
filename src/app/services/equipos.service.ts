import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipo, Jugador } from '../models/equipo.model';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquiposService {
  private apiUrl = 'http://localhost:8080/api/Equipo';
  //private apiUrl = 'https://concludingly-unfeigning-lacresha.ngrok-free.dev/api/Equipo';

  constructor(private http: HttpClient) { }

  getEquipos(): Observable<Equipo[]> {
    const headers = new HttpHeaders().set('ngrok-skip-browser-warning', '1');

    return this.http.get(this.apiUrl, { headers, responseType: 'text' }).pipe(
      map(text => {
        try {
          return JSON.parse(text) as Equipo[];
        } catch (e) {
          console.error('Respuesta no JSON desde API Partido:', text);
          throw new Error('Respuesta inválida del servidor al obtener partidos');
        }
      }),
      catchError(err => {
        console.error('Error en getPartidos:', err);
        return throwError(() => err);
      })
    );
  }

  getEquipoById(id: string): Observable<Equipo> {
    const headers = new HttpHeaders().set('ngrok-skip-browser-warning', '1');
    return this.http.get<Equipo>(`${this.apiUrl}/${id}`);
  }

  getJugadoresByEquipo(equipoId: string): Observable<Jugador[]> {
    const headers = new HttpHeaders().set('ngrok-skip-browser-warning', '1');
    return this.http.get<Jugador[]>(`${this.apiUrl}/${equipoId}/jugadores`);
  }
}
