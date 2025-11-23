import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators, AbstractControl} from '@angular/forms';
import { AdminDbService } from '../admin-db.service';
import { UsuarioService } from '../usuario.service';
//ver si jala aunque no se le envie nada al form logIn sino para corregir y ponereles el requierd
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
  registroForm : FormGroup;
  inicioSesionForm: FormGroup;
  infoUsuario: any[] = [];
  @ViewChild(FormGroupDirective)
  formDirective!:FormGroupDirective; //deberia de cambiarle el nombre a mi form registro para que no se confunda 

  constructor(private dataService:AdminDbService, private usuarioService: UsuarioService){
      this.registroForm = new FormGroup({
        nombreCompleto: new FormControl('', [Validators.required, Validators.maxLength(25), this.specialChars]),
        correo: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(30)]), 
        usuario: new FormControl('', [Validators.required, Validators.maxLength(10), this.specialChars]), 
        contra: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]),  
        confirmarContra: new FormControl('', [Validators.required, this.confirmarContra])
      },
    );
    this.inicioSesionForm = new FormGroup({
        correo: new FormControl(''),
        contra: new FormControl('')
    });
    }
  
  specialChars(control: FormControl): {[key: string]: boolean } | null {
    const nameRegexp: RegExp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (control.value && nameRegexp.test(control.value)) {
       return {invalidName: true};
    }
    else
    return null;
  }

   confirmarContra = (control: AbstractControl): {[key: string]: any} | null => {
    const password = this.registroForm?.get('contra')?.value as string;
    const passwordConfirm = control.value as string;
  
    if (password !== passwordConfirm) {
      return {passwordMatch: true};
    }
  
    return null;
  };

  onSubmit(){
  const isFormRegistroValid = this.registroForm.valid;

  if(isFormRegistroValid){
    
    this.spanRejistro = true;
    this.registrarUsuario();
    this.mostrarMensajeRegistro();
    this.mostrarRegistro();
  }
  else{
    this.isFormFalla = true;
    return
  }
  }

  mostrarRegistro():void{
    this.isRegistroVisible = !this.isRegistroVisible;
  }

  mostrarMensajeRegistro():void
  {
    this.isMensajeRegistroVisible = true;
    setTimeout(() => {
      this.isMensajeRegistroVisible = false;
      this.spanRejistro = false;
    }, 5000);
  }

  registrarUsuario(){  
      this.dataService.registrarUsuario(
        this.registroForm.value.nombreCompleto ?? '', 
        this.registroForm.value.correo ?? '',
        this.registroForm.value.usuario ?? '',
        this.registroForm.value.contra ?? ''
      )
    
    this.formDirective.resetForm();
  }

  logIn(){

      this.dataService.verificarUsuario(
      this.inicioSesionForm.value.correo ?? '',
      this.inicioSesionForm.value.contra ?? ''
    ).subscribe((infoUsuario)=>{
      this.infoUsuario = infoUsuario;
      console.log('Si existe: ', this.infoUsuario);
      this.spanInicio = true;
      this.usuarioService.setUsuarioSesion(true);
      this.usuarioService.setCorreoUsuario(this.inicioSesionForm.value.correo);
      //console.log(this.usuarioService.getCorreoUsuario());
      this.mostrarMensajeRegistro();
    }, (error)=>{
      console.error('Error al verificar contra', error);
      this.mostrarMensajeFallaInicio();
    });
  }

  mostrarMensajeFallaInicio(){
  this.isMensajeFallaInicio = true;
  setTimeout(()=>{
    this.isMensajeFallaInicio = false;
  }, 5000)
  }

}
