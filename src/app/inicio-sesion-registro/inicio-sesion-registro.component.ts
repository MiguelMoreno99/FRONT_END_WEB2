import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio-sesion-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inicio-sesion-registro.component.html',
  styleUrl: './inicio-sesion-registro.component.css'
})
export class InicioSesionRegistroComponent {
  isRegistroVisible: boolean = false;
  isFormFalla: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  registroForm: FormGroup;
  inicioSesionForm: FormGroup;

  @ViewChild(FormGroupDirective)
  formDirective!: FormGroupDirective;

  constructor(private usuarioService: UsuarioService, private router: Router) {
    this.registroForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, this.specialChars]),
      apellido: new FormControl('', [Validators.required, this.specialChars]),
      fechaNacimiento: new FormControl('', [Validators.required, this.fechaPasadaValidator]),
      correo: new FormControl('', [Validators.required, this.emailValidator]),
      contra: new FormControl('', [Validators.required, this.passwordValidator]),
      confirmarContra: new FormControl('', [Validators.required, this.confirmarContra])
    },
    );
    this.inicioSesionForm = new FormGroup({
      correo: new FormControl('', [Validators.required, this.emailValidator]),
      contra: new FormControl('', [Validators.required])
    });
  }

  registrarUsuario() {
    if (this.registroForm.invalid) {
      this.mostrarMensajeError("Hubo un error al registrarse, Verifique la información.");
      this.isFormFalla = true;
      return;
    }
    const fechaInput = this.registroForm.value.fechaNacimiento;
    const fechaISO = new Date(fechaInput).toISOString();
    const registroData = {
      nombre: this.registroForm.value.nombre,
      apellido: this.registroForm.value.apellido,
      fechaNacimiento: fechaISO,
      correo: this.registroForm.value.correo,
      contra: this.registroForm.value.contra,
      rol: 'user'
    };
    this.usuarioService.registrarUsuario(registroData).subscribe({
      next: (resp) => {
        this.mostrarMensajeExito("Tu registro fue exitoso! A continuación inicia sesión");
        this.mostrarRegistro();
        this.formDirective?.resetForm();
        this.registroForm.reset();
      },
      error: (err) => {
        if (err.error.message === "El correo ya está registrado") {
          this.mostrarMensajeError("El correo electronico ingresado ya está asignado a una cuenta!.");
        } else {
          this.mostrarMensajeError("Hubo un error al registrarse, intentelo más tarde.");
        }
      }
    });
  }

  logIn() {
    if (this.inicioSesionForm.invalid) {
      this.mostrarMensajeError("Error verifica tu información.");
      this.isFormFalla = true;
      return;
    }
    const loginData = {
      email: this.inicioSesionForm.value.correo,
      password: this.inicioSesionForm.value.contra
    };

    this.usuarioService.login(loginData).subscribe({
      next: (usuario) => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        if (error.error.message === "Credenciales inválidas") {
          this.mostrarMensajeError("La contraseña o el correo son incorrectos. Intentalo de nuevo");
        } else {
          this.mostrarMensajeError("Hubo un problema para iniciar sesión. Intentalo de nuevo más tarde.");
        }
      }
    });
  }

  specialChars(control: AbstractControl): { [key: string]: boolean } | null {
    const nameRegexp: RegExp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/;
    if (control.value && nameRegexp.test(control.value)) {
      return { invalidName: true };
    }
    else
      return null;
  }

  emailValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const emailRegexp: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (control.value && !emailRegexp.test(control.value)) {
      return { invalidEmail: true };
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

  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const strongPasswordRegexp: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!strongPasswordRegexp.test(value)) {
      return { weakPassword: true };
    }
    return null;
  }

  confirmarContra = (control: AbstractControl): { [key: string]: any } | null => {
    const password = control.parent?.get('contra')?.value;
    const passwordConfirm = control.value;
    if (password && passwordConfirm && password !== passwordConfirm) {
      return { passwordMatch: true };
    }
    return null;
  };

  mostrarRegistro(): void {
    this.isRegistroVisible = !this.isRegistroVisible;
    this.isFormFalla = false;
    this.registroForm.reset();
    this.inicioSesionForm.reset();
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
