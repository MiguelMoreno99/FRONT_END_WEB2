import { Component } from '@angular/core';
import { RouterOutlet, RouterLink} from '@angular/router';
import { AdminMangasService } from '../admin-mangas.service';
import { CommonModule, NgFor} from '@angular/common';
import { UsuarioService } from '../usuario.service';

@Component({
  selector: 'app-mangas',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, NgFor],
  templateUrl: './mangas.component.html',
  styleUrl: './mangas.component.css'
})
export class MangasComponent {
  todosLosMangas: any[] = [];
  nombreSeinenTodosLosMangas: any[] = [];
  nombreShonenTodosLosMangas: any[] = [];
  id:number = 0;
  isInsertarCarrito: boolean = false;

  constructor(private adminMangas: AdminMangasService, private usuarioService: UsuarioService){}

  ngOnInit(): void {
    this.adminMangas.todosLosProductos().subscribe((response) => {
      this.todosLosMangas = response[0];
     /*  this.todosLosMangas.forEach(element => {
        this.id = element.idProducto;
      }); */
    }, (error) => {
      console.error('There was an error retrieving data:', error);
      });
  }

  nombreSeinen(){
    const numGenero = 3;
    this.adminMangas.NombreProductoGenero(numGenero).subscribe((response)=>{
      this.nombreSeinenTodosLosMangas = response[0];
    }, (err)=>{
      console.error('Hubo un problema chiale:', err);
    });
  }

  nombreShonen(){
    const numGeneroShonen = 1;
    this.adminMangas.NombreProductoGenero(numGeneroShonen).subscribe((response)=>{
      this.nombreShonenTodosLosMangas = response[0];
    }, (err)=>{
      console.log('Chiale un problema', err);
    });
  }

  agregarProductoCarritoUsuario(id:number){
    this.mostrarMensajeCarrito();
    console.log(id);
    this.usuarioService.agregarCarritoUsuario(id);
  }

  mostrarMensajeCarrito():void
  {
    this.isInsertarCarrito = true;
    setTimeout(() => {
      this.isInsertarCarrito = false;
    }, 1500);
  }
}
