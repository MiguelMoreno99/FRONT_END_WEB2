import { Component, ElementRef, ViewChild } from '@angular/core';
import { UsuarioService } from '../usuario.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import $ from 'jquery';
@Component({
  selector: 'app-envio-compra',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './envio-compra.component.html',
  styleUrl: './envio-compra.component.css'
})
export class EnvioCompraComponent {
 // @ViewChild('botonPagar', {static:true}) botonPagar?: ElementRef;
  productoCarrito:any[] = [];
  precioTotal: number = 0 ;
  constructor(private usuarioService:UsuarioService){

  }

  ngOnInit(): void {
    this.agregarProductosOrden()
    this.usuarioService.precioTotal$.subscribe((precioTotal)=>{
      this.precioTotal = precioTotal
    });
    $('#botonPagar').click(function () {
     alert('¡Gracias por tu compra!')
    });
  }
  
  
  ngAfterViewInit():void{
    
   
  } 

 
  /* mostrarProductosCarritoUsuario(){
    this.usuarioService.traerProductosCarritoUsuario().subscribe((response)=>{
      this.productoCarrito = response[0];
      
    })
  } */
  
  async agregarProductosOrden(): Promise<void> {
    this.usuarioService.traerProductosCarritoUsuario().subscribe(async (response) => {

      this.productoCarrito = response[0];
      for (let element of this.productoCarrito) {
        await this.usuarioService.agregarProductosOrden(element.idProducto);
      }

    });
  }

  ordenFinalizada(){
    this.usuarioService.ordenAcero();
    this.usuarioService.eliminarTodoCarrito();
  }

  eliminarOrden(){
    this.usuarioService.setPrecioTotal(0);
    this.usuarioService.eliminarOrden();
  }

  
}
