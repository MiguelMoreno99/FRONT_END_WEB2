import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
 

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  usuarioSesionAbierta = new BehaviorSubject<boolean>(false);
  usuarioSesionAbierta$ = this.usuarioSesionAbierta.asObservable();

  correoUsuario = new BehaviorSubject<string>('');
  correoUsuario$ = this.correoUsuario.asObservable();

  precioTotal = new BehaviorSubject<number>(0);
  precioTotal$ = this.precioTotal.asObservable();

  constructor(private http: HttpClient) {}

  setPrecioTotal(precioTotal_: number){
    this.precioTotal.next(precioTotal_) ;
  }
  getPrecioTotal(): number{
    return this.precioTotal.value;
  }

  setUsuarioSesion(usuario_: boolean){
    this.usuarioSesionAbierta.next(usuario_) ;
  }
  getUsuarioSesion(): boolean{
    return this.usuarioSesionAbierta.value;
  }

  setCorreoUsuario(usuario_: string){
    this.correoUsuario.next(usuario_);
  }

  getCorreoUsuario():string{
    return this.correoUsuario.value;
  }

  agregarCarritoUsuario(id:number){
    const bodyInsertarCarrito ={
      correo: this.getCorreoUsuario(), 
      id: id
    }
     this.http.post(' http://localhost:3000/agregarCarritoUsuario', bodyInsertarCarrito).subscribe(
      (error) => {
        console.error('Error al agregar productos:', error);
      }
    );
  }

  traerProductosCarritoUsuario():Observable<any>{
    const bodyCarritoUsuario = {
      correo: this.getCorreoUsuario()
    }
    return this.http.post('http://localhost:3000/traerProductosCarritoUsuario', bodyCarritoUsuario);
  }

  eliminarProductoUsuario(id: number):Observable<any>{
    const bodyEliminarCarritoUsuario = {
      correo: this.getCorreoUsuario(),
      id: id
    }
    return this.http.post('http://localhost:3000/eliminarCarrito', bodyEliminarCarritoUsuario);
  }

  agregarOrden(){
    const bodyAgregarOrden ={
      correo: this.getCorreoUsuario(), 
      precioTotal: this.getPrecioTotal()
    }
     this.http.post(' http://localhost:3000/agregarOrden', bodyAgregarOrden).subscribe(
      (error) => {
        console.error('Error al agregar orden:', error);
      }
    );
  }

  agregarProductosOrden(id:number){
    const bodyAgregarProductoOrden ={
      correo: this.getCorreoUsuario(), 
      id: id
    }
     this.http.post(' http://localhost:3000/agregarProductoOrden', bodyAgregarProductoOrden).subscribe(
      (error) => {
        console.error('Error al agregar productos orden:', error);
      }
    );
  }

  ordenAcero(){
    const bodyOrdenCero = {
      correo: this.getCorreoUsuario()
    }
    this.http.post(' http://localhost:3000/ordenCero', bodyOrdenCero).subscribe(
      (error) => {
        console.error('Error al poner orden en cero:', error);
      }
    );
  }

  eliminarOrden(){
    const bodyEliminarOrden ={
      correo: this.getCorreoUsuario()
    }
    this.http.post(' http://localhost:3000/ordenCero', bodyEliminarOrden).subscribe(
      (error) => {
        console.error('Error al eliminar orden:', error);
      }
    );
  }

  eliminarTodoCarrito(){
    const bodyEliminarTodoCarrito ={
      correo: this.getCorreoUsuario()
    }
    this.http.post(' http://localhost:3000/eliminarTodoCarrito', bodyEliminarTodoCarrito).subscribe(
      (error) => {
        console.error('Error al eliminar orden:', error);
      }
    );
  }
}
