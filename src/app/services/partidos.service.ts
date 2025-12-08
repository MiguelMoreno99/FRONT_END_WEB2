import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Partido, PartidoCreate, PartidoEdit } from '../models/partido.model';

@Injectable({
  providedIn: 'root'
})
export class PartidoService {
  //private apiUrl = 'http://localhost:8080/api/Partido';
  private apiUrl = 'https://concludingly-unfeigning-lacresha.ngrok-free.dev/api/Partido';

  constructor(private http: HttpClient) { }

  getPartidos(): Observable<Partido[]> {
    const headers = new HttpHeaders().set('ngrok-skip-browser-warning', '1');
    return this.http.get(this.apiUrl, { headers, responseType: 'text' }).pipe(
      map(text => {
        try {
          return JSON.parse(text) as Partido[];
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

  crearPartido(partido: PartidoCreate, token: string): Observable<Partido> {
    let headers = new HttpHeaders().set('ngrok-skip-browser-warning', '1');
    headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<Partido>(this.apiUrl, partido, { headers });
  }

  editarPartido(partidoId: string, partido: PartidoEdit, token: string): Observable<Partido> {
    let headers = new HttpHeaders().set('ngrok-skip-browser-warning', '1');
    headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<Partido>(`${this.apiUrl}/${partidoId}`, partido, { headers });
  }

  actualizarMarcador(partidoId: string, golesEquipoA: number, golesEquipoB: number, jugador: string, token: string): Observable<Partido> {
    let headers = new HttpHeaders().set('ngrok-skip-browser-warning', '1');
    headers = headers.set('Authorization', `Bearer ${token}`);
    const body = { golesEquipoA, golesEquipoB, jugador };
    return this.http.patch<Partido>(`${this.apiUrl}/${partidoId}/marcador`, body, { headers });
  }

  iniciarPartido(partidoId: string, token: string): Observable<Partido> {
    let headers = new HttpHeaders().set('ngrok-skip-browser-warning', '1');
    headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.patch<Partido>(`${this.apiUrl}/${partidoId}/iniciar`, {}, { headers });
  }

  finalizarPartido(partidoId: string, token: string): Observable<Partido> {
    let headers = new HttpHeaders().set('ngrok-skip-browser-warning', '1');
    headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.patch<Partido>(`${this.apiUrl}/${partidoId}/finalizar`, {}, { headers });
  }

  eliminarPartido(partidoId: string, token: string): Observable<any> {
    let headers = new HttpHeaders().set('ngrok-skip-browser-warning', '1');
    headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${partidoId}`, { headers });
  }
}