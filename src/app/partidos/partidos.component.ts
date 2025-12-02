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
        },
        error: (err) => this.mostrarMensajeError('No se pudo eliminar de favoritos.')
      });
    } else {
      this.favoritosService.agregarPartido(partidoId, this.userId).subscribe({
        next: (resp) => {
          this.mostrarMensajeExito(resp.message);
          this.favoritosIds.push(partidoId);
          this.actualizarUsuarioStorage();
        },
        error: (err) => this.mostrarMensajeError('No se pudo agregar a favoritos.')
      });
    }
  }

  private actualizarUsuarioStorage() {
    const usuarioActual = this.usuarioService.obtenerInfoUsuario('usuario'); // Ojo: tu método puede variar
    // Como tu UsuarioService es complejo, una forma simple es confiar en que la próxima recarga traerá los datos frescos, 
    // pero para UX inmediata modificamos el array local this.favoritosIds.
    // Si quisieras persistirlo en el service, deberías llamar un método updateLocalUser en el servicio.
  }

  mostrarMensajeExito(msg: string) {
    this.mensajeExito = msg;
    setTimeout(() => this.mensajeExito = '', 3000);
  }

  mostrarMensajeError(msg: string) {
    this.mensajeError = msg;
    setTimeout(() => this.mensajeError = '', 3000);
  }
}
