// src/app/equipos/equipos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EquiposService } from '../services/equipos.service';
import { Equipo, Jugador } from '../models/equipo.model';

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

  // Para filtros
  public searchTerm: string = '';
  public grupoFiltro: string = '';
  
  // Combo box para Grupo (más opciones)
  public grupos: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  
  // Combo box para Posición del jugador
  public posiciones: string[] = [
    'Portero',
    'Defensa Central',
    'Lateral Derecho', 
    'Lateral Izquierdo',
    'Carrilero Derecho',
    'Carrilero Izquierdo',
    'Mediocentro'
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

  constructor(private equiposService: EquiposService) {}

  ngOnInit(): void {
    this.cargarEquipos();
  }

  private cargarEquipos() {
    this.equiposService.getEquipos().subscribe({
      next: (list) => {
        this.equiposView = list.map(equipo => ({
          ...equipo,
          equipoImage: equipo.bandera || 'assets/img/equipos/default.jpg'
        }));
      },
      error: (err) => {
        console.error('Error cargando equipos', err);
      }
    });
  }

  // Modal de visualización
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

  // Modal de edición
  abrirModalEdicion(equipo: Equipo) {
    this.equipoSeleccionado = equipo;
    // Crear una copia para editar
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

  // Guardar cambios
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

  // Métodos para jugadores
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

  // Métodos auxiliares
  prevenirCierre(event: Event) {
    event.stopPropagation();
  }

  // Métodos para ordenar arrays para combobox
  ordenarGrupos(): string[] {
    return [...this.grupos].sort();
  }

  ordenarPosiciones(): string[] {
    return [...this.posiciones].sort((a, b) => a.localeCompare(b));
  }
}