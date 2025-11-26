import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';

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
  infoUsuario: any[] = [];
  @ViewChild(FormGroupDirective)
  formDirective!: FormGroupDirective;

  constructor(private usuarioService: UsuarioService) {
    this.registroForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(30), this.specialChars]),
      apellido: new FormControl('', [Validators.required, Validators.maxLength(40), this.specialChars]),
      fechaNacimiento: new FormControl('', [Validators.required]),
      correo: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(40)]),
      contra: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(25)]),
      confirmarContra: new FormControl('', [Validators.required, this.confirmarContra])
    },
    );
    this.inicioSesionForm = new FormGroup({
      correo: new FormControl('', [Validators.required, Validators.email]),
      contra: new FormControl('', [Validators.required])
    });
  }

  onSubmit() {
    if (this.registroForm.valid) {
      this.registrarUsuario();
    } else {
      this.isFormFalla = true;
    }
  }

  registrarUsuario() {
    if (this.registroForm.invalid) return;
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
    if (this.inicioSesionForm.invalid) return;
    const loginData = {
      email: this.inicioSesionForm.value.correo,
      password: this.inicioSesionForm.value.contra
    };

    this.usuarioService.login(loginData).subscribe({
      next: (usuario) => {
        console.log('Login exitoso:', usuario);
        // Redireccionar a la página de partidos
        // this.router.navigate(['/partidos']); 
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

  confirmarContra = (control: AbstractControl): { [key: string]: any } | null => {
    const password = this.registroForm?.get('contra')?.value as string;
    const passwordConfirm = control.value as string;
    if (password !== passwordConfirm) {
      return { passwordMatch: true };
    }
    return null;
  };

  mostrarRegistro(): void {
    this.isRegistroVisible = !this.isRegistroVisible;
  }

  mostrarMensajeRegistro(): void {
    this.isMensajeRegistroVisible = true;
    setTimeout(() => {
      this.isMensajeRegistroVisible = false;
      this.spanRejistro = false;
    }, 5000);
  }

  mostrarMensajeFallaInicio() {
    this.isMensajeFallaInicio = true;
    setTimeout(() => {
      this.isMensajeFallaInicio = false;
    }, 5000)
  }

  mostrarMensajeFallaRegistro() {
    this.isMensajeFallaRegistro = true;
    setTimeout(() => {
      this.isMensajeFallaRegistro = false;
    }, 5000)
  }
}
