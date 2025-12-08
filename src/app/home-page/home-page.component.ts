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
  public partidosEnJuego: Array<Partido & { stadiumImage: string }> = [];
  public partidosProximos: Array<Partido & { stadiumImage: string }> = [];

  constructor(
    private usuarioService: UsuarioService,
    private partidoService: PartidoService
  ) { };

  ngOnInit(): void {
    this.traerUsuarioActual();
    this.cargarPartidos();
  }

  private traerUsuarioActual(): void {
    this.usuarioService.currentUser$.subscribe({
      next: (usuario) => this.usuarioActual = usuario,
      error: (err) => console.log('Error usuario')
    });
  }

  private cargarPartidos(): void {
    this.partidoService.getPartidos().subscribe({
      next: (partidos) => {
        this.partidosEnJuego = partidos
          .filter(p => p.estado === 'EN_JUEGO')
          .map(p => ({ ...p, stadiumImage: '' }));
        this.partidosProximos = partidos
          .filter(p => p.estado === 'PROGRAMADO')
          .slice(0, 3)
          .map(p => ({ ...p, stadiumImage: '' }));
      },
      error: (err) => console.error('Error cargando partidos', err)
    });
  }
}