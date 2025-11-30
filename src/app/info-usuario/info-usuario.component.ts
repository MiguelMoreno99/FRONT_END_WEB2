import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';

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
  isEditando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, this.specialChars]],
      apellido: ['', [Validators.required, this.specialChars]],
      fechaNacimiento: ['', [Validators.required, this.fechaPasadaValidator]],
      correo: [{ value: '', disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    this.usuarioService.currentUser$.subscribe({
      next: (usuario) => {
        this.usuarioActual = usuario;
      },
      error: (err) => this.mostrarMensajeError('Error al obtener usuario.')
    });
  }

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
        this.ngOnInit()
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

  specialChars(control: AbstractControl): { [key: string]: boolean } | null {
    const nameRegexp: RegExp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/;
    if (control.value && nameRegexp.test(control.value)) {
      return { invalidName: true };
    }
    else
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