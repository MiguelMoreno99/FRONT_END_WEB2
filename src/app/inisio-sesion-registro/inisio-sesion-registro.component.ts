import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inisio-sesion-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inisio-sesion-registro.component.html',
  styleUrl: './inisio-sesion-registro.component.css'
})
export class InisioSesionRegistroComponent {
  isRegistroVisible: boolean = false;
  isMensajeRegistroVisible: boolean = false;
  spanRejistro: boolean = false;
  spanInicio: boolean = false;
  placeHolderReset: boolean = true;
  isFormFalla: boolean = false;
  isMensajeFallaInicio: boolean = false;
  isMensajeFallaRegistro: boolean = false;
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
      correo: new FormControl('', [Validators.required]),
      contra: new FormControl('', [Validators.required])
    });
  }

  registrarUsuario() {
    if (this.registroForm.invalid) {
      this.mostrarMensajeFallaRegistro();
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
        console.log('Usuario registrado:', resp);
        this.mostrarMensajeRegistro();
        this.mostrarRegistro();
        this.formDirective.resetForm();
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.mostrarMensajeFallaRegistro();
      }
    });
  }

  logIn() {
    if (this.inicioSesionForm.invalid) {
      this.mostrarMensajeFallaInicio();
      this.isFormFalla = true;
      return;
    }
    const loginData = {
      email: this.inicioSesionForm.value.correo,
      password: this.inicioSesionForm.value.contra
    };

    this.usuarioService.login(loginData).subscribe({
      next: (usuario) => {
        console.log('Login exitoso:', usuario);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error login', error);
        this.mostrarMensajeFallaInicio();
      }
    });
  }

  specialChars(control: FormControl): { [key: string]: boolean } | null {
    const nameRegexp: RegExp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (control.value && nameRegexp.test(control.value)) {
      return { invalidName: true };
    }
    else
      return null;
  }

  emailValidator(control: FormControl): { [key: string]: boolean } | null {
    const emailRegexp: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (control.value && !emailRegexp.test(control.value)) {
      return { invalidEmail: true };
    }
    return null;
  }

  fechaPasadaValidator(control: FormControl): { [key: string]: boolean } | null {
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

  passwordValidator(control: FormControl): { [key: string]: boolean } | null {
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

  confirmarContra = (control: FormControl): { [key: string]: any } | null => {
    const password = this.registroForm?.get('contra')?.value as string;
    const passwordConfirm = control.value as string;
    if (password !== passwordConfirm) {
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

  mostrarMensajeRegistro(): void {
    this.isMensajeRegistroVisible = true;
    setTimeout(() => {
      this.isMensajeRegistroVisible = false;
      this.spanRejistro = false;
    }, 3000);
  }

  mostrarMensajeFallaInicio() {
    this.isMensajeFallaInicio = true;
    setTimeout(() => {
      this.isMensajeFallaInicio = false;
    }, 3000)
  }

  mostrarMensajeFallaRegistro() {
    this.isMensajeFallaRegistro = true;
    setTimeout(() => {
      this.isMensajeFallaRegistro = false;
    }, 3000)
  }
}
