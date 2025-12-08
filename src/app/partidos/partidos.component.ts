import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { PartidoService } from '../services/partidos.service';
import { Partido, PartidoEdit } from '../models/partido.model';
import { FavoritosService } from '../services/favoritos.service';
import { UsuarioService } from '../services/usuario.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, NgFor, ReactiveFormsModule],
  templateUrl: './partidos.component.html',
  styleUrl: './partidos.component.css'
})
export class PartidosComponent implements OnInit {
  public partidosView: Array<Partido & { stadiumImage: string }> = [];
  public partidoSeleccionado: Partido | null = null;
  public mostrarModal: boolean = false;
  public userId: string | null = null;
  public userToken: string | null = null;
  public favoritosIds: string[] = [];
  public mensajeExito: string = '';
  public mensajeError: string = '';
  public mostrarModalEdicion: boolean = false;
  public partidoEditando: Partido | null = null;
  public mostrarInputGol: boolean = false;
  public equipoAnotador: 'A' | 'B' | null = null;
  public comentarioGol: string = '';

  // Formulario para edición
  public formularioEdicion: FormGroup;

  // Opciones para los selects
  public estados = ['PROGRAMADO', 'EN_JUEGO', 'FINALIZADO'];
  public fases = ['FASE_GRUPOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL'];
  public grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // ruta de imágenes de estadios
  private stadiumImages = [
    'assets/img/estadios/estadio1.jpg',
    'assets/img/estadios/estadio2.jpg',
    'assets/img/estadios/estadio3.jpg',
    'assets/img/estadios/estadio4.jpg'
  ];
  public partidosFiltrados: Array<Partido & { stadiumImage: string }> = [];
  public filtroActual: 'todos' | 'favoritos' | 'en_vivo' = 'todos';

  constructor(private partidoService: PartidoService, private favoritosService: FavoritosService, private usuarioService: UsuarioService, private fb: FormBuilder) {
    this.formularioEdicion = this.fb.group({
      fecha: ['', [Validators.required, this.fechaProximaValidator]],
      hora: ['', Validators.required],
      estadio: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      arbitroPrincipal: ['', [Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/)]],
      estado: ['', [Validators.required]]
    }, {
      validators: [this.validarHoraSiEsHoy]
    });
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
    const fechaControl = control.get('fecha');
    const horaControl = control.get('hora');
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

  ngOnInit(): void {
    this.loadPartidos();
    this.loadUsuario();
  }

  private loadPartidos() {
    this.partidoService.getPartidos().subscribe({
      next: (list) => {
        const partidosValidos = list.filter(p => p.equipoA && p.equipoB);
        this.partidosView = partidosValidos.map(p => ({
          ...p,
          stadiumImage: this.randomImage()
        }));

        this.aplicarFiltro();
        console.log('Partidos cargados (solo válidos):', this.partidosView);
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
        if (usuario.token) {
          this.userToken = usuario.token;
        } else {
          this.userToken = null;
        }
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
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.partidoSeleccionado = null;
    this.mostrarModal = false;
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

  cambiarFiltro(opcion: 'todos' | 'favoritos' | 'en_vivo') {
    this.filtroActual = opcion;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.filtroActual === 'favoritos') {
      this.partidosFiltrados = this.partidosView.filter(p =>
        this.favoritosIds.includes(p.id)
      );
    } else if (this.filtroActual === 'en_vivo') {
      this.partidosFiltrados = this.partidosView.filter(p =>
        p.estado === 'EN_JUEGO'
      );
    } else {
      this.partidosFiltrados = [...this.partidosView];
    }
  }

  abrirModalEdicion(partido: Partido) {
    this.partidoEditando = { ...partido };
    this.cargarDatosEnFormulario();
    this.mostrarModalEdicion = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalEdicion() {
    this.partidoEditando = null;
    this.mostrarModalEdicion = false;
    this.formularioEdicion.reset();
    document.body.style.overflow = 'auto';
  }

  cargarDatosEnFormulario() {
    if (this.partidoEditando) {
      const fechaObj = new Date(this.partidoEditando.fecha);
      const year = fechaObj.getFullYear();
      const month = ('0' + (fechaObj.getMonth() + 1)).slice(-2);
      const day = ('0' + fechaObj.getDate()).slice(-2);
      const fechaFormateada = `${year}-${month}-${day}`;
      const hours = ('0' + fechaObj.getUTCHours()).slice(-2);
      const minutes = ('0' + fechaObj.getUTCMinutes()).slice(-2);
      const horaFormateada = `${hours}:${minutes}`;
      this.formularioEdicion.patchValue({
        fecha: fechaFormateada,
        hora: horaFormateada,
        estadio: this.partidoEditando.estadio,
        ciudad: this.partidoEditando.ciudad,
        fase: this.partidoEditando.fase,
        grupo: this.partidoEditando.grupo || '',
        arbitroPrincipal: this.partidoEditando.arbitroPrincipal || '',
        estado: this.partidoEditando.estado
      });
    }
  }

  guardarCambios() {
    if (this.formularioEdicion.valid && this.partidoEditando && this.userToken) {
      const datosActualizados = this.formularioEdicion.value;
      const fechaString = `${datosActualizados.fecha}T${datosActualizados.hora}:00`;
      const fechaLocal = new Date(fechaString);
      const offset = fechaLocal.getTimezoneOffset() * 60000;
      const fechaAjustada = new Date(fechaLocal.getTime() - offset);

      const partidoEdit: PartidoEdit = {
        fecha: fechaAjustada.toISOString(),
        estadio: datosActualizados.estadio,
        ciudad: datosActualizados.ciudad,
        estado: datosActualizados.estado,
        fase: datosActualizados.fase,
        grupo: datosActualizados.grupo,
        arbitroPrincipal: datosActualizados.arbitroPrincipal
      };

      console.log('Enviando al backend:', partidoEdit);

      this.partidoService.editarPartido(
        this.partidoEditando.id,
        partidoEdit,
        this.userToken!
      ).subscribe({
        next: (partidoActualizado: Partido) => {
          console.log('Respuesta del backend:', partidoActualizado);


          const index = this.partidosView.findIndex(p => p.id === partidoActualizado.id);
          if (index !== -1) {

            const nuevosPartidos = [...this.partidosView];

            nuevosPartidos[index] = {
              ...partidoActualizado,
              stadiumImage: this.partidosView[index].stadiumImage
            };

            this.partidosView = nuevosPartidos;
          }

          this.mostrarMensajeExito('Partido actualizado correctamente.');
          this.loadPartidos()
          this.cerrarModalEdicion();
        },
        error: (error) => {
          console.error('Error al guardar cambios:', error);

          this.mostrarMensajeError('Error al guardar cambios: ' + (error.error?.message || error.message || 'Error desconocido'));
        }
      });
    } else {
      if (!this.userToken) {
        this.mostrarMensajeError('Error: No estás autenticado');
      } else {
        this.mostrarMensajeError('Por favor complete todos los campos requeridos correctamente');
      }
    }
  }

  abrirRegistroGol(equipo: 'A' | 'B') {
    this.equipoAnotador = equipo;
    this.comentarioGol = '';
    this.mostrarInputGol = true;
  }

  cancelarGol() {
    this.mostrarInputGol = false;
    this.equipoAnotador = null;
    this.comentarioGol = '';
  }

  confirmarGol() {
    if (!this.partidoEditando || !this.equipoAnotador || !this.userToken) return;
    const deltaGolA = this.equipoAnotador === 'A' ? 1 : 0;
    const deltaGolB = this.equipoAnotador === 'B' ? 1 : 0;
    const comentario = this.comentarioGol.trim() || `Gol de ${this.equipoAnotador === 'A' ? this.partidoEditando.equipoA.nombre : this.partidoEditando.equipoB.nombre}`;
    this.partidoService.actualizarMarcador(
      this.partidoEditando.id,
      deltaGolA,
      deltaGolB,
      comentario,
      this.userToken
    ).subscribe({
      next: (partidoActualizado) => {
        this.mostrarMensajeExito(`¡Gol registrado correctamente!`);
        this.loadPartidos();
        this.cancelarGol();
        this.cerrarModalEdicion();
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensajeError('Error al registrar el gol en el servidor.');
      }
    });
  }

  iniciarPartido() {
    if (!this.partidoEditando || !this.userToken) return;
    if (confirm('¿Estás seguro de iniciar este partido? Pasará a estado EN_JUEGO.')) {
      this.partidoService.iniciarPartido(this.partidoEditando.id, this.userToken).subscribe({
        next: (partido) => {
          this.loadPartidos();
          this.mostrarMensajeExito('El partido ha comenzado.');
          this.cerrarModalEdicion();
        },
        error: (err) => this.mostrarMensajeError('No se pudo iniciar el partido.')
      });
    }
  }

  finalizarPartido() {
    if (!this.partidoEditando || !this.userToken) return;

    if (confirm('¿Estás seguro de finalizar el partido? Pasará a estado FINALIZADO.')) {
      this.partidoService.finalizarPartido(this.partidoEditando.id, this.userToken).subscribe({
        next: (partido) => {
          this.loadPartidos();
          this.mostrarMensajeExito('El partido ha finalizado.');
          this.cerrarModalEdicion();
        },
        error: (err) => this.mostrarMensajeError('No se pudo finalizar el partido.')
      });
    }
  }

  eliminarPartido(partido: Partido, event: Event) {
    event.stopPropagation();

    if (!this.userToken) return;

    const confirmacion = confirm(
      `¿Estás seguro de eliminar el partido: ${partido.equipoA.nombre} vs ${partido.equipoB.nombre}?\nEsta acción no se puede deshacer.`
    );

    if (confirmacion) {
      this.partidoService.eliminarPartido(partido.id, this.userToken).subscribe({
        next: () => {
          this.partidosView = this.partidosView.filter(p => p.id !== partido.id);
          this.aplicarFiltro();
          this.mostrarMensajeExito('Partido eliminado correctamente.');
        },
        error: (err) => {
          console.error(err);
          this.mostrarMensajeError('No se pudo eliminar el partido.');
        }
      });
    }
  }
}
