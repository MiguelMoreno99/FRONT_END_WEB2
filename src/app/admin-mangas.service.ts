import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, concat } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminMangasService {

  constructor(private http: HttpClient) {}  

  todosLosProductos():Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/productos');    
  }

  NombreProductoGenero(genero:number):Observable<any>{
   const bodyGenero = {
      genero: genero
    }
    return this.http.post<any[]>('http://localhost:3000/traerProductoNombreCategoria', bodyGenero);
  }

  topProductosCategoria(genero:number):Observable<any>{
    const bodyGeneroTopProductos = {
      genero: genero
    }
    return this.http.post<any[]>('http://localhost:3000/topProductosGenero', bodyGeneroTopProductos);
  }

  porductoInfo(id: number):Observable<any>{
    const dataUrl: string  = `http://localhost:3000/${id}`;
    return this.http.get<any[]>(dataUrl);
   }
}
  