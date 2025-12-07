import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EquiposService } from '../services/equipos.service';
import { Equipo, Jugador, EquipoUpdate, JugadorCreate } from '../models/equipo.model';
import { UsuarioService } from '../services/usuario.service';
import { FavoritosService } from '../services/favoritos.service';
import { lastValueFrom } from 'rxjs';

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
  public jugadoresAAgregar: JugadorCreate[] = [];
  public jugadoresAEliminar: string[] = [];

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
    this.jugadoresAAgregar = [];
    this.jugadoresAEliminar = [];
    this.mostrarModalEdicion = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalEdicion() {
    this.equipoSeleccionado = null;
    this.equipoEditado = null;
    this.mostrarModalEdicion = false;
    this.agregandoJugador = false;
    this.jugadoresAAgregar = [];
    this.jugadoresAEliminar = [];
    this.resetearNuevoJugador();
    document.body.style.overflow = 'auto';
  }

  guardarCambios() {
  if (!this.equipoEditado || !this.equipoSeleccionado || !this.userToken) {
    this.mensajeError = !this.userToken ? 'No estás autenticado' : 'Datos del equipo no disponibles';
    return;
  }

  // Verificar si hay algo para guardar
  const equipoUpdate: EquipoUpdate = this.crearEquipoUpdate();
  const hayCambiosEquipo = Object.keys(equipoUpdate).length > 0;
  const hayCambiosJugadores = this.jugadoresAAgregar.length > 0 || this.jugadoresAEliminar.length > 0;

  if (!hayCambiosEquipo && !hayCambiosJugadores) {
    this.mensajeError = 'No se detectaron cambios para guardar';
    return;
  }

  this.guardando = true;
  this.mensajeExito = '';
  this.mensajeError = '';

  // Si hay cambios en el equipo, actualizarlo primero
  if (hayCambiosEquipo) {
    this.actualizarEquipoYJugadores(equipoUpdate);
  } else {
    // Solo manejar jugadores
    this.manejarJugadores();
  }
}

private crearEquipoUpdate(): EquipoUpdate {
  const equipoUpdate: EquipoUpdate = {};

  if (!this.equipoSeleccionado || !this.equipoEditado) return equipoUpdate;

  if (this.equipoEditado.nombre !== this.equipoSeleccionado.nombre) {
    equipoUpdate.nombre = this.equipoEditado.nombre;
  }
  
  if (this.equipoEditado.nombreCompletoPais !== this.equipoSeleccionado.nombreCompletoPais) {
    equipoUpdate.nombreCompletoPais = this.equipoEditado.nombreCompletoPais;
  }
  
  if (this.equipoEditado.bandera !== this.equipoSeleccionado.bandera) {
    equipoUpdate.bandera = this.equipoEditado.bandera;
  }
  
  if (this.equipoEditado.informacion !== this.equipoSeleccionado.informacion) {
    equipoUpdate.informacion = this.equipoEditado.informacion;
  }
  
  if (this.equipoEditado.grupo !== this.equipoSeleccionado.grupo) {
    equipoUpdate.grupo = this.equipoEditado.grupo;
  }
  
  if (this.equipoEditado.rankingFifa !== this.equipoSeleccionado.rankingFifa) {
    equipoUpdate.rankingFifa = this.equipoEditado.rankingFifa;
  }

  return equipoUpdate;
}

private actualizarEquipoYJugadores(equipoUpdate: EquipoUpdate) {
  this.equiposService.editarEquipo(this.equipoSeleccionado!.id, equipoUpdate, this.userToken!).subscribe({
    next: (equipoActualizado) => {
      // Actualizar equipo en la vista
      this.actualizarEquipoEnVista(equipoActualizado);
      
      // Si hay jugadores para manejar, continuar
      if (this.jugadoresAAgregar.length > 0 || this.jugadoresAEliminar.length > 0) {
        this.manejarJugadores();
      } else {
        this.finalizarGuardado('Equipo actualizado correctamente');
      }
    },
    error: (err) => this.manejarErrorEquipo(err)
  });
}

private manejarJugadores() {
  const promesas: Promise<any>[] = [];

  // Crear promesas para agregar jugadores
  this.jugadoresAAgregar.forEach((jugador, index) => {
    promesas.push(
      lastValueFrom(
        this.equiposService.agregarJugador(
          this.equipoSeleccionado!.id,
          jugador,
          this.userToken!
        )
      )
      .then(jugadorCreado => {
        this.actualizarJugadorTemporalEnUI(index, jugadorCreado);
      })
      .catch(err => {
        console.error('Error agregando jugador:', err);
        throw new Error(`Error con "${jugador.nombre}": ${err.error?.message || 'Error desconocido'}`);
      })
    );
  });

  // Crear promesas para eliminar jugadores
  this.jugadoresAEliminar.forEach(jugadorId => {
    promesas.push(
      lastValueFrom(
        this.equiposService.eliminarJugador(
          this.equipoSeleccionado!.id,
          jugadorId,
          this.userToken!
        )
      )
      .catch(err => {
        console.error('Error eliminando jugador:', err);
        throw new Error(`Error eliminando jugador ID ${jugadorId}`);
      })
    );
  });

  // Ejecutar todas las operaciones en paralelo
  Promise.all(promesas)
    .then(() => {
      this.finalizarGuardado('Todos los cambios aplicados');
    })
    .catch(error => {
      this.guardando = false;
      this.mensajeError = error.message || 'Error aplicando cambios';
    });
}

private agregarJugadoresSecuencialmente(index: number) {
  if (index >= this.jugadoresAAgregar.length) {
    // Todos los jugadores agregados, ahora eliminar si es necesario
    if (this.jugadoresAEliminar.length > 0) {
      this.eliminarJugadoresSecuencialmente(0);
    } else {
      this.finalizarGuardado('Jugadores agregados correctamente');
    }
    return;
  }

  const jugador = this.jugadoresAAgregar[index];
  
  this.equiposService.agregarJugador(
    this.equipoSeleccionado!.id, 
    jugador, 
    this.userToken!
  ).subscribe({
    next: (jugadorCreado) => {
      // Actualizar el jugador temporal con el ID real en equipoEditado
      this.actualizarJugadorTemporalEnUI(index, jugadorCreado);
      
      // Continuar con el siguiente jugador
      this.agregarJugadoresSecuencialmente(index + 1);
    },
    error: (err) => {
      console.error('Error agregando jugador:', err);
      this.mensajeError = `Error agregando jugador "${jugador.nombre} ${jugador.apellido}": ${
        err.error?.message || 'Error desconocido'
      }`;
      this.guardando = false;
    }
  });
}

private actualizarJugadorTemporalEnUI(indexTemp: number, jugadorReal: Jugador) {
  if (!this.equipoEditado || !this.equipoEditado.jugadores) return;
  
  // Buscar el jugador temporal por su posición en la lista
  const jugadoresTemporales = this.equipoEditado.jugadores.filter(j => 
    j.id && j.id.startsWith('temp_')
  );
  
  if (indexTemp < jugadoresTemporales.length) {
    const jugadorTemp = jugadoresTemporales[indexTemp];
    const indexReal = this.equipoEditado.jugadores.findIndex(j => j.id === jugadorTemp.id);
    
    if (indexReal !== -1) {
      this.equipoEditado.jugadores[indexReal] = jugadorReal;
    }
  }
}

private eliminarJugadoresSecuencialmente(index: number) {
  if (index >= this.jugadoresAEliminar.length) {
    this.finalizarGuardado('Jugadores eliminados correctamente');
    return;
  }

  const jugadorId = this.jugadoresAEliminar[index];
  
  this.equiposService.eliminarJugador(
    this.equipoSeleccionado!.id, 
    jugadorId, 
    this.userToken!
  ).subscribe({
    next: () => {
      // Continuar con el siguiente jugador
      this.eliminarJugadoresSecuencialmente(index + 1);
    },
    error: (err) => {
      console.error('Error eliminando jugador:', err);
      this.mensajeError = `Error eliminando jugador: ${err.error?.message || 'Error desconocido'}`;
      this.guardando = false;
      
      // Intentar continuar con los demás jugadores
      setTimeout(() => {
        this.eliminarJugadoresSecuencialmente(index + 1);
      }, 1000);
    }
  });
}
private actualizarEquipoEnVista(equipoActualizado: Equipo) {
  const index = this.equiposView.findIndex(e => e.id === equipoActualizado.id);
  if (index !== -1) {
    this.equiposView[index] = {
      ...equipoActualizado,
      equipoImage: equipoActualizado.bandera || 'assets/img/equipos/default.jpg'
    };
  }

  // Actualizar también el equipo seleccionado
  this.equipoSeleccionado = equipoActualizado;
  
  // Aplicar filtros
  this.aplicarFiltro();
}

private finalizarGuardado(mensaje: string) {
  this.guardando = false;
  this.mensajeExito = mensaje;

  // Cerrar modal después de 2 segundos
  setTimeout(() => {
    this.cerrarModalEdicion();
    this.mensajeExito = '';
  }, 2000);
}

private manejarErrorEquipo(err: any) {
  console.error('Error actualizando equipo:', err);
  this.guardando = false;
  
  if (err.error && err.error.message) {
    this.mensajeError = err.error.message;
  } else if (err.status === 401) {
    this.mensajeError = 'No autorizado. Tu sesión puede haber expirado.';
  } else if (err.status === 404) {
    this.mensajeError = 'Equipo no encontrado.';
  } else if (err.status === 400) {
    this.mensajeError = 'Datos inválidos. Verifica la información.';
  } else {
    this.mensajeError = 'Error al actualizar el equipo. Intenta de nuevo.';
  }
  
  setTimeout(() => {
    this.mensajeError = '';
  }, 5000);
}

  agregarJugador() {
    if (!this.equipoEditado) return;

    // Validar campos requeridos
    if (!this.nuevoJugador.nombre || !this.nuevoJugador.apellido || !this.nuevoJugador.posicion) {
      this.mensajeError = 'Nombre, apellido y posición son requeridos';
      return;
    }

    // Validar fecha de nacimiento
    if (!this.nuevoJugador.fechaNacimiento) {
      this.mensajeError = 'La fecha de nacimiento es requerida';
      return;
    }

    // Validar número de camiseta
    if (!this.nuevoJugador.numeroCamiseta || this.nuevoJugador.numeroCamiseta <= 0) {
      this.mensajeError = 'El número de camiseta debe ser mayor a 0';
      return;
    }

    // Crear jugador para agregar
    const jugadorAAgregar: JugadorCreate = {
      nombre: this.nuevoJugador.nombre,
      apellido: this.nuevoJugador.apellido,
      fechaNacimiento: new Date(this.nuevoJugador.fechaNacimiento).toISOString(),
      numeroCamiseta: this.nuevoJugador.numeroCamiseta,
      posicion: this.nuevoJugador.posicion
    };

    // Agregar a la lista temporal
    this.jugadoresAAgregar.push(jugadorAAgregar);

    // También agregar al equipoEditado para mostrar en la UI
    if (!this.equipoEditado.jugadores) {
      this.equipoEditado.jugadores = [];
    }
    
    // Agregar con ID temporal para mostrar
    this.equipoEditado.jugadores.push({
      ...jugadorAAgregar,
      id: `temp_${Date.now()}`
    });

    // Resetear formulario
    this.resetearNuevoJugador();
    this.agregandoJugador = false;
    this.mensajeError = '';
  }

  eliminarJugador(jugadorId: string) {
  if (!this.equipoEditado || !this.equipoEditado.jugadores) return;

  // Si es un jugador temporal (agregado en esta sesión), remover de jugadoresAAgregar
  if (jugadorId.startsWith('temp_')) {
    const tempIndex = this.jugadoresAAgregar.findIndex(j => 
      `temp_${this.jugadoresAAgregar.indexOf(j)}` === jugadorId
    );
    if (tempIndex !== -1) {
      this.jugadoresAAgregar.splice(tempIndex, 1);
    }
  } else {
    // Si es un jugador existente, agregar a la lista de eliminación
    this.jugadoresAEliminar.push(jugadorId);
  }

  // Remover de la vista
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