import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';
import { PartidoService } from '../services/partidos.service'; // Si necesitas este servicio
import { EquiposService } from '../services/equipos.service'; // Si necesitas este servicio
import { Equipo } from '../models/equipo.model';

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

  mostrarModalPartido: boolean = false;
  mostrarModalEquipo: boolean = false;

  equiposDisponibles: Equipo[] = [];
  public fases = ['FASE_GRUPOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL'];
  grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  posiciones = ['Portero', 'Defensa', 'Medio', 'Delantero'];

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
    this.cargarEquiposDisponibles();
    this.configurarLogicaGrupoAutomatico();
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
    equipoData.siglasEquipo = equipoData.siglasEquipo.toUpperCase();
    console.log('Equipo a guardar:', equipoData);

    // Aquí llamarías al servicio para guardar el equipo
    // this.equipoService.crearEquipo(equipoData).subscribe(...)

    this.mostrarMensajeExito('Equipo creado exitosamente!');
    this.cerrarModalEquipo();
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