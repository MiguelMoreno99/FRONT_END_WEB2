import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, RegistroRequest, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})

export class UsuarioService {
  private apiUrl = 'https://concludingly-unfeigning-lacresha.ngrok-free.dev/api/Usuarios';

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkToken();
  }

  registrarUsuario(datos: RegistroRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, datos);
  }

  login(datos: LoginRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/login`, datos).pipe(
      tap((usuario: Usuario) => {
        this.guardarSesion(usuario);
      })
    );
  }

  private guardarSesion(usuario: Usuario): void {
    if (usuario.token) {
      localStorage.setItem('authToken', usuario.token);
    }
    localStorage.setItem('usuarioData', JSON.stringify(usuario));
    this.currentUserSubject.next(usuario);
    this.isLoggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuarioData');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  private checkToken(): void {
    const userJson = localStorage.getItem('usuarioData');
    const token = localStorage.getItem('authToken');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

}
