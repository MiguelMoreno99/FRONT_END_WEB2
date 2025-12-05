import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';
import { PartidoService } from '../services/partidos.service'; // Si necesitas este servicio
import { EquiposService } from '../services/equipos.service'; // Si necesitas este servicio

@Component({
  selector: 'app-info-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './info-usuario.component.html',
  styleUrl: './info-usuario.component.css'
})
export class InfoUsuarioComponent implements OnInit {
  usuarioActual: Usuario | null = null;
  perfilForm: FormGroup;
  partidoForm: FormGroup;
  equipoForm: FormGroup;
  
  isEditando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  
  // Estados para modales
  mostrarModalPartido: boolean = false;
  mostrarModalEquipo: boolean = false;
  
  // Listas para selects
  equiposDisponibles: any[] = []; // Cambia 'any' por tu tipo de equipo
  fases = ['Fase de Grupos', 'Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Final'];
  grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  estados = ['Programado', 'En Juego', 'Finalizado', 'Cancelado'];
  posiciones = ['Portero', 'Defensa', 'Medio', 'Delantero'];

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private router: Router,
    private partidoService: PartidoService, // Inyecta si necesitas
    private equipoService: EquiposService // Inyecta si necesitas
  ) {
    // Formulario de perfil
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, this.specialChars]],
      apellido: ['', [Validators.required, this.specialChars]],
      fechaNacimiento: ['', [Validators.required, this.fechaPasadaValidator]],
      correo: [{ value: '', disabled: true }, Validators.required]
    });

    // Formulario para nuevo partido
    this.partidoForm = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      estadio: ['', Validators.required],
      ciudad: ['', Validators.required],
      fase: ['', Validators.required],
      grupo: [''],
      arbitroPrincipal: [''],
      estado: ['Programado', Validators.required],
      equipoA: ['', Validators.required],
      equipoB: ['', Validators.required],
      golesEquipoA: [0, [Validators.required, Validators.min(0)]],
      golesEquipoB: [0, [Validators.required, Validators.min(0)]]
    });

    // Formulario para nuevo equipo
    this.equipoForm = this.fb.group({
      nombre: ['', Validators.required],
      nombreCompletoPais: ['', Validators.required],
      siglasEquipo: ['', [Validators.required, Validators.maxLength(3)]],
      grupo: ['', Validators.required],
      rankingFifa: [0, [Validators.required, Validators.min(0)]],
      informacion: [''],
      jugadores: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.usuarioService.currentUser$.subscribe({
      next: (usuario) => {
        this.usuarioActual = usuario;
      },
      error: (err) => this.mostrarMensajeError('Error al obtener usuario.')
    });

    // Cargar equipos disponibles para el formulario de partidos
    this.cargarEquiposDisponibles();
  }

  // Getter para jugadores (FormArray)
  get jugadoresArray(): FormArray {
    return this.equipoForm.get('jugadores') as FormArray;
  }

  // Métodos para modales
  abrirModalPartido(): void {
    this.mostrarModalPartido = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalPartido(): void {
    this.mostrarModalPartido = false;
    this.partidoForm.reset({
      estado: 'Programado',
      golesEquipoA: 0,
      golesEquipoB: 0
    });
    document.body.style.overflow = 'auto';
  }

  abrirModalEquipo(): void {
    this.mostrarModalEquipo = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalEquipo(): void {
    this.mostrarModalEquipo = false;
    this.equipoForm.reset();
    this.jugadoresArray.clear();
    document.body.style.overflow = 'auto';
  }

  prevenirCierre(event: Event): void {
    event.stopPropagation();
  }

  // Cargar equipos disponibles
  cargarEquiposDisponibles(): void {
    // Aquí deberías cargar los equipos existentes
    // Por ahora, uso datos de ejemplo
    this.equiposDisponibles = [
      { id: 1, nombre: 'Argentina' },
      { id: 2, nombre: 'Brasil' },
      { id: 3, nombre: 'España' },
      { id: 4, nombre: 'Francia' },
      { id: 5, nombre: 'Alemania' },
      { id: 6, nombre: 'Italia' }
    ];
  }

  // Métodos para formulario de partido
  guardarPartido(): void {
    if (this.partidoForm.invalid) {
      this.partidoForm.markAllAsTouched();
      this.mostrarMensajeError('Por favor, complete todos los campos requeridos.');
      return;
    }

    const partidoData = this.partidoForm.value;
    
    // Combinar fecha y hora
    const fechaCompleta = new Date(partidoData.fecha);
    const [horas, minutos] = partidoData.hora.split(':');
    fechaCompleta.setHours(horas, minutos);

    const partidoCompleto = {
      ...partidoData,
      fecha: fechaCompleta.toISOString(),
      // Aquí necesitarías buscar los objetos completos de equipoA y equipoB
      equipoA: this.equiposDisponibles.find(e => e.id === partidoData.equipoA),
      equipoB: this.equiposDisponibles.find(e => e.id === partidoData.equipoB)
    };

    console.log('Partido a guardar:', partidoCompleto);
    
    // Aquí llamarías al servicio para guardar el partido
    // this.partidoService.crearPartido(partidoCompleto).subscribe(...)
    
    this.mostrarMensajeExito('Partido creado exitosamente!');
    this.cerrarModalPartido();
  }

  // Métodos para formulario de equipo
  agregarJugador(): void {
    const jugadorForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      numeroCamiseta: ['', [Validators.required, Validators.min(1), Validators.max(99)]],
      posicion: ['', Validators.required],
      fechaNacimiento: [''],
      clubActual: ['']
    });

    this.jugadoresArray.push(jugadorForm);
  }

  removerJugador(index: number): void {
    this.jugadoresArray.removeAt(index);
  }

  guardarEquipo(): void {
    if (this.equipoForm.invalid) {
      this.equipoForm.markAllAsTouched();
      this.mostrarMensajeError('Por favor, complete todos los campos requeridos.');
      return;
    }

    const equipoData = this.equipoForm.value;
    
    // Convertir siglas a mayúsculas
    equipoData.siglasEquipo = equipoData.siglasEquipo.toUpperCase();

    console.log('Equipo a guardar:', equipoData);
    
    // Aquí llamarías al servicio para guardar el equipo
    // this.equipoService.crearEquipo(equipoData).subscribe(...)
    
    this.mostrarMensajeExito('Equipo creado exitosamente!');
    this.cerrarModalEquipo();
  }

  // Validaciones
  specialChars(control: AbstractControl): { [key: string]: boolean } | null {
    const nameRegexp: RegExp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/;
    if (control.value && nameRegexp.test(control.value)) {
      return { invalidName: true };
    }
    return null;
  }

  fechaPasadaValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) {
      return null;
    }
    const inputDate = new Date(control.value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate >= today) {
      return { fechaFutura: true };
    }
    return null;
  }

  // Métodos existentes (sin cambios)
  activarEdicion(): void {
    if (this.usuarioActual) {
      let fechaFormatoInput = '';
      if (this.usuarioActual.usuario.fechaNacimiento) {
        fechaFormatoInput = this.usuarioActual.usuario.fechaNacimiento.split('T')[0];
      }
      this.perfilForm.patchValue({
        nombre: this.usuarioActual.usuario.nombre,
        apellido: this.usuarioActual.usuario.apellido,
        correo: this.usuarioActual.usuario.correo,
        fechaNacimiento: fechaFormatoInput
      });
      this.isEditando = true;
      this.mensajeExito = '';
      this.mensajeError = '';
    }
  }

  cancelarEdicion(): void {
    this.isEditando = false;
    this.perfilForm.reset();
  }

  guardarCambios(): void {
    // ... (código existente)
  }

  confirmarEliminacion(): void {
    // ... (código existente)
  }

  cerrarSesion(): void {
    // ... (código existente)
  }

  mostrarMensajeError(mensaje: string): void {
    this.mensajeError = mensaje;
    setTimeout(() => {
      this.mensajeError = '';
    }, 3000);
  }

  mostrarMensajeExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    setTimeout(() => {
      this.mensajeExito = '';
    }, 3000);
  }
}