import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
@Injectable({

 providedIn: 'root' 
 
})

export class AdminDbService {
 private dataUrl = 'http://localhost:3000/data';  // The URL to the backend endpoint
 private dataInsert = 'http://localhost:3000/insert'
 
 constructor(private http: HttpClient) {}        // Inject HttpClient to make HTTP requests 

 getData(): Observable<any[]> {
 return this.http.get<any[]>(this.dataUrl);    // Fetch data from the backend
 }

 

 registrarUsuario(nombreCompleto_: string, correo_: string, usuario_: string, contra_: string) {
   const registrarUsuario = {
     nombre: nombreCompleto_,
     correo: correo_,
     nombreUsuario: usuario_,
     contra: contra_,
   };

   this.http.post(this.dataInsert, registrarUsuario).subscribe(
     (error) => {
       console.error('Error al registrar usuario:', error);
     }
   );
 }

 verificarUsuario(correo_: string, contra_: string):Observable<any[]>{
  const verificaUsuario = {
    correo: correo_,
    contra: contra_
  }
  return  this.http.post<any[]>('http://localhost:3000/verificar', verificaUsuario);
 }

 todosLosProductos():Observable<any[]> {
  return this.http.get<any[]>('http://localhost:3000/productos');    // Fetch data from the backend
  }
}

