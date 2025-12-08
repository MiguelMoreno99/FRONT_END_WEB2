import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';
import { PartidoService } from '../services/partidos.service';
import { EquiposService } from '../services/equipos.service';
import { Equipo} from '../models/equipo.model';
import { Partido } from '../models/partido.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-info-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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

  mostrarModalPartido: boolean = false;
  mostrarModalEquipo: boolean = false;

  mostrarModalMarcador: boolean = false;
  partidosDisponibles: Partido[] = [];
  partidoSeleccionado: Partido | null = null;
  marcadorForm: FormGroup;
  editandoMarcador: boolean = false;
  unGolA: boolean = true;
  unGolB: boolean = true;
  golesEquipoA: number = 0;
  golesEquipoB: number = 0;
  jugadoresEquipoA: any[] = [];  
  jugadoresEquipoB: any[] = [];  
  jugadorAnotoGolA: string = ''; 
  jugadorAnotoGolB: string = ''; 

  equiposDisponibles: Equipo[] = [];
  public fases = ['FASE_GRUPOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL'];
  grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  posiciones = [
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

  // En el componente, agrega estas propiedades

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private router: Router,
    private partidoService: PartidoService,
    private equipoService: EquiposService
  ) {

    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, this.specialChars]],
      apellido: ['', [Validators.required, this.specialChars]],
      fechaNacimiento: ['', [Validators.required, this.fechaPasadaValidator]],
      correo: [{ value: '', disabled: true }, Validators.required]
    });

    this.partidoForm = this.fb.group({
      fechaPartido: ['', [Validators.required, this.fechaProximaValidator]],
      horaPartido: ['', Validators.required],
      estadio: ['', Validators.required],
      ciudad: ['', Validators.required],
      equipoA: ['', Validators.required],
      equipoB: ['', Validators.required],
      fase: ['', Validators.required],
      grupo: [''],
      arbitroPrincipal: ['']
    }, {
      validators: [this.validarHoraSiEsHoy, this.validarEquipoRepetido]
    })

    this.equipoForm = this.fb.group({
      nombreEquipo: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$')]],
      nombreCompleto: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$')]],
      siglasEquipo: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(3),
        Validators.pattern('^[A-Z]+$')
      ]],
      bandera: ['https://flagcdn.com/', [Validators.required, Validators.pattern('https://flagcdn.com/.+')]],
      grupoEquipo: ['', Validators.required],
      rankingFifa: [0, [Validators.required, Validators.min(1), Validators.max(211)]],
      informacion: ['', Validators.maxLength(500)],
      jugadores: this.fb.array([])
    });

    this.marcadorForm = this.fb.group({
    golesEquipoA: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
    golesEquipoB: [0, [Validators.required, Validators.min(0), Validators.max(20)]], 
    jugadorAnotoGolA: [''],
    jugadorAnotoGolB: ['']
  });
  
  }

  
  onSiglasInput(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.equipoForm.get('siglasEquipo')?.setValue(input.value, { emitEvent: false });
  }

  ngOnInit(): void {
    this.usuarioService.currentUser$.subscribe({
      next: (usuario) => {
        this.usuarioActual = usuario;
      },
      error: (err) => this.mostrarMensajeError('Error al obtener usuario.')
    });
    this.cargarEquiposDisponibles();
    this.configurarLogicaGrupoAutomatico();
    this.cargarPartidosDisponibles();
  }

    cargarPartidosDisponibles(): void {
    this.partidoService.getPartidos().subscribe({
      next: (partidos: Partido[]) => {
        this.partidosDisponibles = partidos
          .filter(p => p.estado === 'EN_JUEGO')
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      },
      error: (error) => {
        console.error('Error cargando partidos:', error);
        this.mostrarMensajeError('No se pudieron cargar los partidos.');
      }
    });
  }

  abrirModalMarcador(): void {
    this.mostrarModalMarcador = true;
    this.partidoSeleccionado = null;
    this.editandoMarcador = false;
    this.marcadorForm.reset({ golesEquipoA: 0, golesEquipoB: 0 });
    document.body.style.overflow = 'hidden';
  }

  cerrarModalMarcador(): void {
    this.mostrarModalMarcador = false;
    this.partidoSeleccionado = null;
    this.editandoMarcador = false;
    this.unGolA = true;
    this.unGolB = true;
    document.body.style.overflow = 'auto';
}

  // Seleccionar un partido para editar marcador
  seleccionarPartido(partido: Partido): void {
    this.partidoSeleccionado = partido;
    this.editandoMarcador = true;
    
    // Cargar el marcador actual si existe
    this.marcadorForm.patchValue({
      golesEquipoA: partido.golesEquipoA || 0,
      golesEquipoB: partido.golesEquipoB || 0
    });

    // this.cargarJugadoresEquipo(partido.equipoA.id, 'A');
    // this.cargarJugadoresEquipo(partido.equipoB.id, 'B');
  }

  cargarJugadoresEquipo(equipoId: string, equipo: 'A' | 'B'): void {
  this.equipoService.getEquipoById(equipoId).subscribe({
    next: (equipoData: Equipo) => {
      const jugadores = equipoData.jugadores || [];
      
      if (equipo === 'A') {
        this.jugadoresEquipoA = jugadores.map(j => ({
         id: j.id,
          nombre: j.nombre,
          apellido: j.apellido,
          fechaNacimiento: j.fechaNacimiento,
          numero: j.numeroCamiseta,
          posicion: j.posicion
        }));
        console.log('Jugadores equipo A:', this.jugadoresEquipoA);
      } else {
        this.jugadoresEquipoB = jugadores.map(j => ({
          id: j.id,
          nombre: j.nombre,
          apellido: j.apellido,
          fechaNacimiento: j.fechaNacimiento,
          numero: j.numeroCamiseta,
          posicion: j.posicion
        }));
        console.log('Jugadores equipo B:', this.jugadoresEquipoB);
      }
    },
    error: (err) => {
      console.error(`Error cargando jugadores del equipo ${equipo}:`, err);
    }
  });
}

getNombreJugadorPorId(jugadorId: string, equipo: 'A' | 'B'): string {
  const jugadores = equipo === 'A' ? this.jugadoresEquipoA : this.jugadoresEquipoB;
  const jugador = jugadores.find(j => j.id === jugadorId);
  
  if (jugador) {
    return jugador.nombreCompleto;
  }
  
  // Si no encuentra el jugador, busca en ambos equipos por si acaso
  const todosJugadores = [...this.jugadoresEquipoA, ...this.jugadoresEquipoB];
  const jugadorEncontrado = todosJugadores.find(j => j.id === jugadorId);
  
  return jugadorEncontrado ? jugadorEncontrado.nombreCompleto : 'Jugador Desconocido';
}

// O versión más específica
getNombreJugadorEquipoA(jugadorId: string): string {
  const jugador = this.jugadoresEquipoA.find(j => j.id === jugadorId);
  return jugador ? jugador.nombreCompleto : 'Jugador Desconocido';
}

getNombreJugadorEquipoB(jugadorId: string): string {
  const jugador = this.jugadoresEquipoB.find(j => j.id === jugadorId);
  return jugador ? jugador.nombreCompleto : 'Jugador Desconocido';
}

// Función para incrementar/decrementar goles
incrementarGoles(equipo: 'equipoA' | 'equipoB'): void {
  const control = equipo === 'equipoA' ? 'golesEquipoA' : 'golesEquipoB';
  const currentValue = this.marcadorForm.get(control)?.value || 0;
  if (equipo === 'equipoA'){
    this.unGolA = false;
    this.golesEquipoA = 1;
  }else{
    this.golesEquipoA = 0;
  }
  if(equipo==="equipoB"){
    this.unGolB = false;
    this.golesEquipoB = 1;
  }else{
    this.golesEquipoB = 0;
  }

  if (currentValue < 20) { // Límite máximo de 20
    this.marcadorForm.get(control)?.setValue(currentValue + 1);
  }
  
}

decrementarGoles(equipo: 'equipoA' | 'equipoB'): void {
  const control = equipo === 'equipoA' ? 'golesEquipoA' : 'golesEquipoB';
  const currentValue = this.marcadorForm.get(control)?.value || 0;
  
  if (currentValue > 0) { // No puede ser negativo
    this.marcadorForm.get(control)?.setValue(currentValue - 1);
  }
}

// Guardar el marcador actualizado
guardarMarcador(): void {
  if (!this.partidoSeleccionado || !this.usuarioActual?.token) {
    this.mostrarMensajeError('No hay partido seleccionado o no estás autenticado.');
    return;
  }

  if (this.marcadorForm.invalid) {
    this.marcadorForm.markAllAsTouched();
    return;
  }

  //const { golesEquipoA, golesEquipoB } = this.marcadorForm.value;
  
  // Validar que al menos uno tenga goles si se está actualizando
  if (this.golesEquipoA === 0 && this.golesEquipoB === 0) {
    const confirmar = confirm('Ambos equipos tienen 0 goles. ¿Estás seguro de guardar este marcador?');
    if (!confirmar) return;
  }

  // const nombreJugadorA = this.jugadorAnotoGolA 
  //   ? this.getNombreJugadorEquipoA(this.jugadorAnotoGolA)
  //   : '';
  
  // const nombreJugadorB = this.jugadorAnotoGolB 
  //   ? this.getNombreJugadorEquipoB(this.jugadorAnotoGolB)
  //   : '';

  // Determinar qué jugador enviar (SOLO UNO)
  // let jugadorSeleccionado = '';
  
  // if (this.golesEquipoA > 0 && this.golesEquipoB > 0) {
  //   // Si ambos anotaron, elige uno (pregunta al usuario o usa lógica)
  //   const opcion = confirm('Ambos equipos anotaron. ¿Enviar jugador del Equipo A?\n\n' +
  //                         `Equipo A: ${nombreJugadorA}\n` +
  //                         `Equipo B: ${nombreJugadorB}\n\n` +
  //                         'Click OK para Equipo A, Cancel para Equipo B');
    
  //   jugadorSeleccionado = opcion ? nombreJugadorA : nombreJugadorB;
    
  // } else if (this.golesEquipoA > 0) {
  //   // Solo equipo A anotó
  //   if (!this.jugadorAnotoGolA) {
  //     this.mostrarMensajeError('Debes seleccionar el jugador que anotó para el equipo A');
  //     return;
  //   }
  //   jugadorSeleccionado = nombreJugadorA;
    
  // } else if (this.golesEquipoB > 0) {
  //   // Solo equipo B anotó
  //   if (!this.jugadorAnotoGolB) {
  //     this.mostrarMensajeError('Debes seleccionar el jugador que anotó para el equipo B');
  //     return;
  //   }
  //   jugadorSeleccionado = nombreJugadorB;
  // }
  
  // Si no hay goles, jugadorSeleccionado queda vacío

  // Validar que al menos uno tenga goles
  if (this.golesEquipoA === 0 && this.golesEquipoB === 0) {
    const confirmar = confirm('Ambos equipos tienen 0 goles. ¿Estás seguro de guardar este marcador?');
    if (!confirmar) return;
  }

  console.log('Enviando al backend:', {
    golesEquipoA: this.golesEquipoA,
    golesEquipoB: this.golesEquipoB,
    //jugador: jugadorSeleccionado
  });

  this.partidoService.actualizarMarcador(
    this.partidoSeleccionado.id,
    this.golesEquipoA,
    this.golesEquipoB,
    //jugadorSeleccionado, 
    this.usuarioActual.token
  ).subscribe({
    next: (partidoActualizado) => {
      const index = this.partidosDisponibles.findIndex(p => p.id === partidoActualizado.id);
      if (index !== -1) {
        this.partidosDisponibles[index] = partidoActualizado;
      }
      
      this.mostrarMensajeExito('Marcador actualizado correctamente!');
      
      setTimeout(() => {
        this.cerrarModalMarcador();
      }, 2000);
    },
    error: (err) => {
      console.error('Error actualizando marcador:', err);
      this.mostrarMensajeError(err.error?.message || 'Error al actualizar el marcador.');
    }
  });
}

// Función para formatear fecha
formatearFecha(fechaString: string): string {
  const fecha = new Date(fechaString);
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Función para obtener el estado del partido como texto legible
getEstadoPartido(estado: string): string {
  const estados: {[key: string]: string} = {
    'PROGRAMADO': 'Programado',
    'EN_CURSO': 'En Curso', 
    'FINALIZADO': 'Finalizado',
    'SUSPENDIDO': 'Suspendido'
  };
  return estados[estado] || estado;
}

// Función para obtener nombre del equipo por ID
getNombreEquipo(equipoId: string): string {
  const equipo = this.equiposDisponibles.find(e => e.id === equipoId);
  return equipo ? equipo.nombre : 'Equipo Desconocido';
}

  get jugadoresArray(): FormArray {
    return this.equipoForm.get('jugadores') as FormArray;
  }

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

  cargarEquiposDisponibles(): void {
    this.equipoService.getEquipos().subscribe({
      next: (data: Equipo[]) => {
        this.equiposDisponibles = data;
        this.equiposDisponibles.sort((a, b) => a.nombre.localeCompare(b.nombre));
      },
      error: (error) => {
        this.mostrarMensajeError('No se pudieron cargar los equipos. Intente más tarde.');
      }
    });
  }

  configurarLogicaGrupoAutomatico(): void {
    const faseControl = this.partidoForm.get('fase');
    const equipoAControl = this.partidoForm.get('equipoA');
    const grupoControl = this.partidoForm.get('grupo');
    faseControl?.valueChanges.subscribe(faseSeleccionada => {
      if (faseSeleccionada === 'FASE_GRUPOS') {
        this.actualizarGrupoDesdeEquipoA();
        grupoControl?.disable();
      } else {
        grupoControl?.enable();
        grupoControl?.setValue('');
      }
    });
    equipoAControl?.valueChanges.subscribe(() => {
      if (faseControl?.value === 'FASE_GRUPOS') {
        this.actualizarGrupoDesdeEquipoA();
      }
    });
  }

  private actualizarGrupoDesdeEquipoA(): void {
    const equipoAId = this.partidoForm.get('equipoA')?.value;
    const grupoControl = this.partidoForm.get('grupo');
    if (equipoAId) {
      const equipoEncontrado = this.equiposDisponibles.find(e => e.id === equipoAId);
      if (equipoEncontrado && equipoEncontrado.grupo) {
        grupoControl?.setValue(equipoEncontrado.grupo);
      }
    }
  }

  guardarPartido(): void {
    if (this.partidoForm.invalid) {
      this.partidoForm.markAllAsTouched();
      this.mostrarMensajeError('Por favor, complete todos los campos requeridos.');
      return;
    }
    const formValue = this.partidoForm.getRawValue();
    try {
      const fechaString = `${formValue.fechaPartido}T${formValue.horaPartido}:00`;
      const fechaLocal = new Date(fechaString);
      const offset = fechaLocal.getTimezoneOffset() * 60000;
      const fechaAjustada = new Date(fechaLocal.getTime() - offset);
      const nuevoPartido = {
        equipoAId: formValue.equipoA,
        equipoBId: formValue.equipoB,
        fecha: fechaAjustada.toISOString(),
        estadio: formValue.estadio,
        ciudad: formValue.ciudad,
        estado: 'PROGRAMADO',
        fase: formValue.fase,
        grupo: formValue.grupo || "",
        arbitroPrincipal: formValue.arbitroPrincipal,
      };
      this.partidoService.crearPartido(nuevoPartido, this.usuarioActual?.token || "").subscribe({
        next: (res) => {
          this.mostrarMensajeExito('¡Partido creado exitosamente!');
          this.cerrarModalPartido();
        },
        error: (err) => {
          console.error('Error creando partido:', err);
          this.mostrarMensajeError(err.error || 'Error al crear el partido. Intente más tarde.');
        }
      });

    } catch (error) {
      console.error('Error al procesar fechas:', error);
      this.mostrarMensajeError('Error interno procesando la fecha del partido.');
    }
  }

  guardarEquipo(): void {
    if (this.equipoForm.invalid) {
      this.equipoForm.markAllAsTouched();
      this.mostrarMensajeError('Por favor, complete todos los campos requeridos.');
      return;
    }
    const formValue = this.equipoForm.getRawValue();
    try {
      const jugadoresProcesados = formValue.jugadores.map((jugador: any) => {
        const fechaNac = jugador.fechaNacimiento ? new Date(jugador.fechaNacimiento).toISOString() : new Date().toISOString();
        return {
          id: "",
          nombre: jugador.nombre,
          apellido: jugador.apellido,
          fechaNacimiento: fechaNac,
          numeroCamiseta: Number(jugador.numeroCamiseta),
          posicion: jugador.posicion
        };
      });
      const nuevoEquipo = {
        nombre: formValue.nombreEquipo,
        nombreCompletoPais: formValue.nombreCompleto,
        bandera: formValue.bandera,
        informacion: formValue.informacion || "",
        siglasEquipo: formValue.siglasEquipo,
        grupo: formValue.grupoEquipo,
        rankingFifa: formValue.rankingFifa,
        jugadores: jugadoresProcesados
      };
      this.equipoService.crearEquipo(nuevoEquipo, this.usuarioActual?.token || "").subscribe({
        next: (res) => {
          this.mostrarMensajeExito('¡Equipo creado exitosamente!');
          this.cerrarModalEquipo();
        },
        error: (err) => {
          console.error('Error creando equipo:', err);
          this.mostrarMensajeError(err.error || 'Error al crear el equipo. Intente más tarde.');
        }
      });

    } catch (error) {
      this.mostrarMensajeError('Error procesando los datos del formulario.');
    }
  }

  agregarJugador(): void {
    const jugadorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$')]],
      numeroCamiseta: ['', [Validators.required, Validators.min(1), Validators.max(999)]],
      posicion: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, this.fechaPasadaValidator]]
    });
    this.jugadoresArray.push(jugadorForm);
  }

  removerJugador(index: number): void {
    this.jugadoresArray.removeAt(index);
  }

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

  fechaProximaValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) {
      return null;
    }
    const inputDate = new Date(control.value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate < today) {
      return { fechaAnterior: true };
    }
    return null;
  }

  validarHoraSiEsHoy: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const fechaControl = control.get('fechaPartido');
    const horaControl = control.get('horaPartido');
    if (!fechaControl?.value || !horaControl?.value) {
      return null;
    }
    const inputDate = new Date(fechaControl.value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate.getTime() === today.getTime()) {
      const now = new Date();
      const [hours, minutes] = horaControl.value.split(':');
      const inputDateTime = new Date();
      inputDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (inputDateTime <= now) {
        horaControl.setErrors({ ...horaControl.errors, horaFutura: true });
        return { horaFutura: true };
      }
    }
    if (horaControl.errors && horaControl.errors['horaFutura']) {
      delete horaControl.errors['horaFutura'];
      if (Object.keys(horaControl.errors).length === 0) {
        horaControl.setErrors(null);
      } else {
        horaControl.setErrors(horaControl.errors);
      }
    }
    return null;
  };

  validarEquipoRepetido: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const equipoA = control.get('equipoA');
    const equipoB = control.get('equipoB');
    if (!equipoA?.value || !equipoB?.value) {
      return null;
    }
    if (equipoA.value === equipoB.value) {
      equipoB.setErrors({ ...equipoB.errors, repetido: true });
      return { repetido: true };
    }
    if (equipoB.hasError('repetido')) {
      delete equipoB.errors?.['repetido'];
      if (equipoB.errors && Object.keys(equipoB.errors).length === 0) {
        equipoB.setErrors(null);
      } else {
        equipoB.setErrors(equipoB.errors);
      }
    }
    return null;
  };

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
    if (this.perfilForm.invalid || !this.usuarioActual) {
      this.mostrarMensajeError('Error verifica tu información.');
      return;
    }
    const datosActualizados = {
      correo: this.usuarioActual.usuario.correo,
      nombre: this.perfilForm.get('nombre')?.value,
      apellido: this.perfilForm.get('apellido')?.value,
      fechaNacimiento: new Date(this.perfilForm.get('fechaNacimiento')?.value).toISOString(),
      activo: true,
      favoritos: {
        partidos: [],
        equipos: []
      }
    };
    this.usuarioService.actualizarUsuario(datosActualizados).subscribe({
      next: (usuarioRespuesta) => {
        this.mostrarMensajeExito('Información actualizada correctamente.');
        this.isEditando = false;
      },
      error: (err) => {
        if (err.error.message === "Usuario no encontrado") {
          this.mostrarMensajeError('Error Usuario no encontrado.');
        } else {
          this.mostrarMensajeError('Error no se pudo actualizar la información, intentelo más tarde.');
        }
      }
    });
  }

  confirmarEliminacion(): void {
    if (!this.usuarioActual) return;
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (confirmacion) {
      this.usuarioService.eliminarUsuario(this.usuarioActual.usuario.id).subscribe({
        next: () => {
          alert('Cuenta eliminada correctamente.');
          this.cerrarSesion();
        },
        error: (err) => {
          this.mostrarMensajeError('No se pudo eliminar la cuenta. Intentelo mas tarde.');
        }
      });
    }
  }

  cerrarSesion(): void {
    this.usuarioService.logout();
    this.router.navigate(['/']);
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