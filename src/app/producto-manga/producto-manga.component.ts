import { Component } from '@angular/core';
import { AdminMangasService } from '../admin-mangas.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../usuario.service';
@Component({
  selector: 'app-producto-manga',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-manga.component.html',
  styleUrl: './producto-manga.component.css'
})
export class ProductoMangaComponent {
 
  productoInfo: any[] = [];
  mangaProductoId = 0;
  isInsertarCarrito:boolean = false;

  constructor(private adminMangas: AdminMangasService, private route: ActivatedRoute, private usuarioService: UsuarioService){
    this.mangaProductoId = Number(this.route.snapshot.params['id']);
  }

  ngOnInit(): void{
    this.adminMangas.porductoInfo(this.mangaProductoId).subscribe((response)=>{
      this.productoInfo = response[0];
    })
  }
  agregarProductoCarritoUsuario(id:number){
    this.mostrarMensajeCarrito();
    console.log(id);
    this.usuarioService.agregarCarritoUsuario(id);
  }

  mostrarMensajeCarrito(){
    this.isInsertarCarrito = true;
  }
}
