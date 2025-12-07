import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EquiposService } from '../services/equipos.service';
import { Equipo, Jugador } from '../models/equipo.model';
import { UsuarioService } from '../services/usuario.service';
import { FavoritosService } from '../services/favoritos.service';

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './equipos.component.html',
  styleUrls: ['./equipos.component.css']
})
export class EquiposComponent implements OnInit {
  public equiposView: Array<Equipo & { equipoImage: string }> = [];
  public equipoSeleccionado: Equipo | null = null;
  public equipoEditado: Equipo | null = null;
  public mostrarModal: boolean = false;
  public mostrarModalEdicion: boolean = false;
  public guardando: boolean = false;
  public mensajeExito: string = '';
  public mensajeError: string = '';
  public userId: string | null = null;
  public userToken: string | null = null;
  public favoritosIds: string[] = [];
  public equiposFiltrados: Array<Equipo & { equipoImage: string }> = [];
  public filtroActual: 'todos' | 'favoritos' = 'todos';

  public searchTerm: string = '';
  public grupoFiltro: string = '';

  public grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  public posiciones: string[] = [
    'Portero',
    'Defensa Central',
    'Lateral Derecho',
    'Lateral Izquierdo',
    'Carrilero',
    'Pivote (MCD)',
    'Mediocentro (MC)',
    'Volante',
    'Mediapunta (MCO)',
    'Extremo Derecho',
    'Extremo Izquierdo',
    'Segundo Delantero',
    'Delantero Centro'
  ];

  // Para nuevo jugador
  public nuevoJugador: Jugador = {
    id: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    numeroCamiseta: 0,
    posicion: ''
  };
  public agregandoJugador: boolean = false;

  constructor(private equiposService: EquiposService, private usuarioService: UsuarioService,
    private favoritosService: FavoritosService) { }

  ngOnInit(): void {
    this.cargarEquipos();
    this.loadUsuario();
  }

  private loadUsuario() {
    this.usuarioService.currentUser$.subscribe(usuario => {
      if (usuario && usuario.usuario) {
        this.userId = usuario.usuario.id;
        this.favoritosIds = usuario.usuario.favoritos?.equipos || [];
        this.userToken = usuario.token || null;
      } else {
        this.userId = null;
        this.favoritosIds = [];
        this.userToken = null;
      }
    });
  }

  esFavorito(equipoId: string): boolean {
    return this.favoritosIds.includes(equipoId);
  }

  toggleFavorito(equipoId: string): void {
    if (!this.userId) return;

    if (this.esFavorito(equipoId)) {
      this.favoritosService.eliminarEquipo(equipoId, this.userId).subscribe({
        next: (resp) => {
          this.favoritosIds = this.favoritosIds.filter(id => id !== equipoId);
          this.mostrarMensajeExito(resp.message);
          this.actualizarUsuarioStorage();
          this.aplicarFiltro();
        },
        error: () => {
          this.mostrarMensajeError('No se pudo eliminar de favoritos.');
        }
      });
    } else {
      this.favoritosService.agregarEquipo(equipoId, this.userId).subscribe({
        next: (resp) => {
          this.favoritosIds.push(equipoId);
          this.mostrarMensajeExito(resp.message);
          this.actualizarUsuarioStorage();
          this.aplicarFiltro();
        },
        error: () => {
          this.mostrarMensajeError('No se pudo agregar a favoritos.');
        }
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
      usuarioData.usuario.favoritos.equipos = this.favoritosIds;
      localStorage.setItem('usuarioData', JSON.stringify(usuarioData));
    }
    this.usuarioService.checkSession();
  }

  private cargarEquipos() {
    this.equiposService.getEquipos().subscribe({
      next: (list) => {
        this.equiposView = list.map(equipo => ({
          ...equipo,
          equipoImage: equipo.bandera || 'assets/img/equipos/default.jpg'
        }));
        this.aplicarFiltro();
      },
      error: (err) => {
        console.error('Error cargando equipos', err);
      }
    });
  }

  aplicarFiltro() {
    if (this.filtroActual === 'favoritos') {
      this.equiposFiltrados = this.equiposView.filter(e =>
        this.favoritosIds.includes(e.id)
      );
    } else {
      this.equiposFiltrados = [...this.equiposView];
    }
  }

  cambiarFiltro(opcion: 'todos' | 'favoritos') {
    this.filtroActual = opcion;
    this.aplicarFiltro();
  }

  abrirModal(equipo: Equipo) {
    this.equipoSeleccionado = equipo;
    this.mostrarModal = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.equipoSeleccionado = null;
    this.mostrarModal = false;
    document.body.style.overflow = 'auto';
  }

  abrirModalEdicion(equipo: Equipo) {
    this.equipoSeleccionado = equipo;
    this.equipoEditado = JSON.parse(JSON.stringify(equipo));
    this.mostrarModalEdicion = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalEdicion() {
    this.equipoSeleccionado = null;
    this.equipoEditado = null;
    this.mostrarModalEdicion = false;
    this.agregandoJugador = false;
    this.resetearNuevoJugador();
    document.body.style.overflow = 'auto';
  }

  guardarCambios() {
    if (!this.equipoEditado || !this.equipoSeleccionado) return;

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    // this.equiposService.actualizarEquipo(this.equipoSeleccionado.id, this.equipoEditado).subscribe({
    //   next: (equipoActualizado) => {
    //     // Actualizar en la lista
    //     const index = this.equiposView.findIndex(e => e.id === equipoActualizado.id);
    //     if (index !== -1) {
    //       this.equiposView[index] = {
    //         ...equipoActualizado,
    //         equipoImage: equipoActualizado.bandera || 'assets/img/equipos/default.jpg'
    //       };
    //     }

    //     this.guardando = false;
    //     this.mensajeExito = 'Equipo actualizado correctamente';
    //     this.equipoSeleccionado = equipoActualizado;

    //     // Cerrar modal después de 2 segundos
    //     setTimeout(() => {
    //       this.cerrarModalEdicion();
    //       this.mensajeExito = '';
    //     }, 2000);
    //   },
    //   error: (err) => {
    //     console.error('Error actualizando equipo:', err);
    //     this.guardando = false;
    //     this.mensajeError = 'Error al actualizar el equipo. Intenta de nuevo.';
    //   }
    // });
  }

  agregarJugador() {
    if (!this.equipoEditado) return;

    // Validar campos requeridos
    if (!this.nuevoJugador.nombre || !this.nuevoJugador.apellido || !this.nuevoJugador.posicion) {
      this.mensajeError = 'Nombre, apellido y posición son requeridos';
      return;
    }

    // // Generar ID temporal
    // this.nuevoJugador.id = 'temp_' + Date.now();

    // // Agregar jugador a la lista
    // if (!this.equipoEditado.jugadores) {
    //   this.equipoEditado.jugadores = [];
    // }
    // this.equipoEditado.jugadores.push({...this.nuevoJugador});

    // Resetear formulario
    this.resetearNuevoJugador();
    this.agregandoJugador = false;
  }

  eliminarJugador(jugadorId: string) {
    if (!this.equipoEditado || !this.equipoEditado.jugadores) return;

    this.equipoEditado.jugadores = this.equipoEditado.jugadores.filter(j => j.id !== jugadorId);
  }

  resetearNuevoJugador() {
    this.nuevoJugador = {
      id: '',
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      numeroCamiseta: 0,
      posicion: ''
    };
  }

  prevenirCierre(event: Event) {
    event.stopPropagation();
  }

  ordenarGrupos(): string[] {
    return [...this.grupos].sort();
  }

  ordenarPosiciones(): string[] {
    return [...this.posiciones].sort((a, b) => a.localeCompare(b));
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