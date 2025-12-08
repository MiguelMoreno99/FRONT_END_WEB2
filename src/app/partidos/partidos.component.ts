import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { PartidoService } from '../services/partidos.service';
import { Partido, PartidoEdit } from '../models/partido.model';
import { FavoritosService } from '../services/favoritos.service';
import { UsuarioService } from '../services/usuario.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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

  // Formulario para edición
  public formularioEdicion: FormGroup;

  // Opciones para los selects
  public estados = ['PROGRAMADO', 'EN_JUEGO', 'FINALIZADO', 'SUSPENDIDO'];
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
  public filtroActual: 'todos' | 'favoritos' = 'todos';

  constructor(private partidoService: PartidoService, private favoritosService: FavoritosService, private usuarioService: UsuarioService, private fb: FormBuilder) {
    // Inicializar formulario
     this.formularioEdicion = this.fb.group({
    fecha: ['', [Validators.required]], // Nota: fecha también debe tener array
    estadio: ['', [
      Validators.required,
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-.,()]+$/), 
      Validators.minLength(3),
      Validators.maxLength(100)
    ]],
    ciudad: ['', [
      Validators.required,
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
      Validators.minLength(2),
      Validators.maxLength(50)
    ]],
    fase: ['', [Validators.required]], // Array aquí también
    grupo: ['', [Validators.pattern(/^[A-H]?$/)]], // Array aquí también
    arbitroPrincipal: ['', [
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/),
      Validators.maxLength(100)
    ]],
    estado: ['', [Validators.required]] // Array aquí también
  });
  }

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
      const fechaFormateada = fechaObj.toISOString().split('T')[0];

      this.formularioEdicion.patchValue({
        fecha: fechaFormateada,
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
    const partidoEdit: PartidoEdit = {
      fecha: datosActualizados.fecha,
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
        

        this.cerrarModalEdicion();
      },
      error: (error) => {
        console.error('Error al guardar cambios:', error);
        
        this.mostrarMensajeError('Error al guardar cambios: ' + (error.error?.message || error.message || 'Error desconocido'));
      }
    });
  } else {
    if (!this.userToken ) {
      this.mostrarMensajeError('Error: No estás autenticado');
    } else {
      this.mostrarMensajeError('Por favor complete todos los campos requeridos correctamente');
    }
  }
}

  tieneError(controlName: string, errorType: string): boolean {
    const control = this.formularioEdicion.get(controlName);
    return control ? control.hasError(errorType) && (control.dirty || control.touched) : false;
  }
}
