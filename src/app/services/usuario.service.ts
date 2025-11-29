import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, RegistroRequest, Usuario, EditRequest } from '../models/usuario.model';

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
    this.checkSession();
  }

  registrarUsuario(datos: RegistroRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, datos);
  }

  actualizarUsuario(datos: EditRequest): Observable<Usuario> {
    return this.http.put<Usuario>(this.apiUrl, datos).pipe(
      tap((usuarioActualizado) => {
        this.guardarSesion(usuarioActualizado);
      })
    );
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  login(datos: LoginRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/login`, datos).pipe(
      tap((usuario: Usuario) => {
        this.guardarSesion(usuario);
      })
    );
  }

  private guardarSesion(usuario: Usuario): void {
    localStorage.setItem('usuarioData', JSON.stringify(usuario));
    this.currentUserSubject.next(usuario);
    this.isLoggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('usuarioData');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  private checkSession(): void {
    const userJson = localStorage.getItem('usuarioData');
    if (userJson) {
      try {
        const userObj = JSON.parse(userJson);
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(userObj);
        // if (userObj.token) {
        //   this.http.post<boolean>(`${this.apiUrl}/validar-token`, { token: userObj.token })
        //     .subscribe({
        //       next: (esValido) => {
        //         if (!esValido) this.logout();
        //       },
        //       error: (err) => {
        //         console.error('Error de validación:', err);
        //         this.logout();
        //       }
        //     });
        // }
      } catch (e) {
        console.error('Datos de sesión corruptos', e);
        this.logout();
      }
    }
  }

  obtenerInfoUsuario(campo: string): any {
    // campos posibles:
    // activo
    // nombre
    // apellido
    // correo
    // favoritos
    // fechaNacimiento
    // fechaRegistro
    // id
    // rol
    // token
    // message
    const usuarioJson = localStorage.getItem('usuarioData');
    if (!usuarioJson) {
      return null;
    }
    try {
      const objetoCompleto = JSON.parse(usuarioJson);
      if (objetoCompleto.usuario && objetoCompleto.usuario[campo] !== undefined) {
        return objetoCompleto.usuario[campo];
      }
      if (objetoCompleto[campo] !== undefined) {
        return objetoCompleto[campo];
      }
      return null;
    } catch (e) {
      console.error('Error al leer datos del usuario del storage', e);
      return null;
    }
  }
}
