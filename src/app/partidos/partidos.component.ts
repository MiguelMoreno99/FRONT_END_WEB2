import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { PartidoService } from '../services/partidos.service';
import { Partido } from '../models/partido.model';
import { FavoritosService } from '../services/favoritos.service';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, NgFor],
  templateUrl: './partidos.component.html',
  styleUrl: './partidos.component.css'
})
export class PartidosComponent implements OnInit {
  public partidosView: Array<Partido & { stadiumImage: string }> = [];
  public partidoSeleccionado: Partido | null = null;
  public mostrarModal: boolean = false;
  public userId: string | null = null;
  public favoritosIds: string[] = [];
  public mensajeExito: string = '';
  public mensajeError: string = '';
  private stadiumImages = [
    'assets/img/estadios/estadio1.jpg',
    'assets/img/estadios/estadio2.jpg',
    'assets/img/estadios/estadio3.jpg',
    'assets/img/estadios/estadio4.jpg'
  ];
  public partidosFiltrados: Array<Partido & { stadiumImage: string }> = [];
  public filtroActual: 'todos' | 'favoritos' = 'todos';

  constructor(private partidoService: PartidoService, private favoritosService: FavoritosService, private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.loadPartidos();
    this.loadUsuario();
  }

  private loadPartidos() {
    this.partidoService.getPartidos().subscribe({
      next: (list) => {
        this.partidosView = list.map(p => ({
          ...p,
          stadiumImage: this.randomImage()
        }));
        this.aplicarFiltro();
        console.log('Partidos cargados:', this.partidosView);
      },
      error: (err) => {
        console.error('Error cargando partidos', err);
      }
    });
  }

  private loadUsuario() {
    this.usuarioService.currentUser$.subscribe(usuario => {
      if (usuario && usuario.usuario) {
        this.userId = usuario.usuario.id;
        this.favoritosIds = usuario.usuario.favoritos?.partidos || [];
      } else {
        this.userId = null;
        this.favoritosIds = [];
      }
    });
  }

  private randomImage(): string {
    if (!this.stadiumImages.length) return '';
    const i = Math.floor(Math.random() * this.stadiumImages.length);
    return this.stadiumImages[i];
  }

  abrirModal(partido: Partido) {
    this.partidoSeleccionado = partido;
    this.mostrarModal = true;
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.partidoSeleccionado = null;
    this.mostrarModal = false;
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  prevenirCierre(event: Event) {
    event.stopPropagation();
  }

  esFavorito(partidoId: string): boolean {
    return this.favoritosIds.includes(partidoId);
  }

  toggleFavorito(partidoId: string): void {
    if (!this.userId) return;

    if (this.esFavorito(partidoId)) {
      this.favoritosService.eliminarPartido(partidoId, this.userId).subscribe({
        next: (resp) => {
          this.mostrarMensajeExito(resp.message);
          this.favoritosIds = this.favoritosIds.filter(id => id !== partidoId);
          this.actualizarUsuarioStorage();
          this.aplicarFiltro();
        },
        error: (err) => this.mostrarMensajeError('No se pudo eliminar de favoritos.')
      });
    } else {
      this.favoritosService.agregarPartido(partidoId, this.userId).subscribe({
        next: (resp) => {
          this.mostrarMensajeExito(resp.message);
          this.favoritosIds.push(partidoId);
          this.actualizarUsuarioStorage();
          this.aplicarFiltro();
        },
        error: (err) => this.mostrarMensajeError('No se pudo agregar a favoritos.')
      });
    }
  }

  private actualizarUsuarioStorage() {
    const usuarioJson = localStorage.getItem('usuarioData');

    if (usuarioJson) {
      const usuarioData = JSON.parse(usuarioJson);
      if (!usuarioData.usuario.favoritos) {
        usuarioData.usuario.favoritos = { partidos: [], equipos: [] };
      }
      usuarioData.usuario.favoritos.partidos = this.favoritosIds;
      localStorage.setItem('usuarioData', JSON.stringify(usuarioData));
    }
    this.usuarioService.checkSession();
  }

  mostrarMensajeExito(msg: string) {
    this.mensajeExito = msg;
    setTimeout(() => this.mensajeExito = '', 3000);
  }

  mostrarMensajeError(msg: string) {
    this.mensajeError = msg;
    setTimeout(() => this.mensajeError = '', 3000);
  }

  cambiarFiltro(opcion: 'todos' | 'favoritos') {
    this.filtroActual = opcion;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.filtroActual === 'favoritos') {
      this.partidosFiltrados = this.partidosView.filter(p =>
        this.favoritosIds.includes(p.id)
      );
    } else {
      this.partidosFiltrados = [...this.partidosView];
    }
  }
}
