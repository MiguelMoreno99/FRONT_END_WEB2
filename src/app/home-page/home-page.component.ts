import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PartidoService } from '../services/partidos.service';
import { Partido } from '../models/partido.model';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {

  usuarioActual: Usuario | null = null;
  partidosDestacados: Partido[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private partidoService: PartidoService
  ) { };

  ngOnInit(): void {
    this.traerUsuarioActual();
    this.traerPartidosDestacados();
  }

  private traerUsuarioActual(): void {
    this.usuarioService.currentUser$.subscribe({
      next: (usuario) => this.usuarioActual = usuario,
      error: (err) => console.log('Error usuario')
    });
  }

  private traerPartidosDestacados(): void {
    this.partidoService.getPartidos().subscribe({
      next: (partidos) => this.partidosDestacados = partidos.slice(0, 3),
      error: (err) => console.error('Error cargando partidos destacados', err)
    });
  }
}