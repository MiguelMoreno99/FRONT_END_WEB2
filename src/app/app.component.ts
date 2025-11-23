import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink} from '@angular/router';
//import { provideRouter } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { BotonContactanosComponent } from './boton-contactanos/boton-contactanos.component';
import { InisioSesionRegistroComponent } from './inisio-sesion-registro/inisio-sesion-registro.component';
import { UsuarioService } from './usuario.service';
import { CommonModule } from '@angular/common';
import { IStepOption, TourMatMenuModule, TourService } from 'ngx-ui-tour-md-menu';
// import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HomePageComponent, BotonContactanosComponent, InisioSesionRegistroComponent,
    RouterLink, CommonModule, TourMatMenuModule
  ],
  template: `
  <header class="header"> 
    <div class="contenedor">
      <div class="logo" tourAnchor="logoHome">
        <a [routerLink]="['/']"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Panini_group_logo.png" alt="Panini Logo"></a>
      </div>
      <form>
        <div class="search">
              <input class="search-input" type="search" placeholder="Buscar en la Tienda">  
              <a style="color: black;"[routerLink]="['/info-usuario']" >
              <i class="fa fa-search" aria-hidden="true"></i></a>
        </div>
      </form>
        <div class="container-hero">
              <div class="hero">
                  <div class="container-user">
                    @if(this.isUsuarioSesionAbierta){
                      <div class="infoUsuario">
                        <span>{{this.usuarioService.getCorreoUsuario()}}</span>
                      </div>
                      <a [routerLink]="['/info-usuario']" class="btn">
                      <i class="fa-solid fa-user"></i></a>
                    }
                    @else{
                      <a [routerLink]="['/inicio-de-sesion-registro']" class="btn">
                      <i class="fa-solid fa-user" tourAnchor="LogInRegister"></i></a>
                    }
                      <i class="fa-solid fa-cart-shopping" (click)="muestraCarrito()" (click)="this.mostrarProductosCarritoUsuario()" tourAnchor="Carrito"></i>
                  </div>
              </div>
          </div>
    </div>
    <div class="container-cart-products" *ngIf ="isCartHidden" >
      <div class="cart-product">
        <div class="info-cart-product" *ngFor="let producto of this.productosCarritoUsuario" >
          <span class="cantidad-producto-carrito">1:</span>
            <p class="titulo-producto-carrito">{{producto.nombre}}</p> 
            <span class="precio-producto-carrito">{{producto.precio}}</span>
            <svg 
              (click)="this.eliminarProducto(producto.idProducto)"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="icon-close"
              styles="width: 2px; height: 2px  margin-top: 20%;"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
            />
            </svg>
      </div>
        </div>
        <div class="cart-total">
          <h3>Total productos:</h3>
            <span class="total-pagar">{{this.precioTotal}}</span>
            <button [routerLink]="['/envio-compra']" (click)="agregarOrden()" (click)="muestraCarrito()" >Continuar</button>
        </div>
    </div>
  </header>
  <div class = "render-todo-menos-header">
  <tour-step-template></tour-step-template>
  <router-outlet></router-outlet>
  </div>

`,
  styleUrl: './app.component.css', 
  /* animations: [
    trigger('transformMenu', [
      state('start', style({
        transform: 'translateX(0)'
      })),
      state('end', style({
        transform: 'translateX(100%)'
      })),
      transition('start => end', [
        animate('0.5s')
      ]),
      transition('end => start', [
        animate('0.5s')
      ])
    ])
  ] */
})


export class AppComponent {
  title = 'proyectoUix';
  isUsuarioSesionAbierta:boolean = false;
  isCartHidden: boolean = false;
  productosCarritoUsuario: any[] = [];
  precioTotal: number = 0;
  isOrdenSigue: boolean = true;
  //correoUsuario: string;
  public readonly tourService = inject(TourService);
  readonly tourSteps: IStepOption[] = [

    {
      anchorId: 'logoHome',
      content: 'Si lo presionas, siempre regresas a la página principal.',
      title: 'logo Menu',
      enableBackdrop: true,
    },
    {
      anchorId: 'LogInRegister',
      content: 'Aquí te puedes registrar o iniciar sesión para empezar tus compras.',
      title: 'Inicio Sesión y Registro',
      enableBackdrop: true,
    },
    {
      anchorId: 'Carrito',
      content: 'Aquí puedes ir verificando que productos vas agregando al carrito, así como también los puedes ir eliminando.',
      title: 'Carrito',
      enableBackdrop: true,
    },

  ]
  muestraCarrito() {
    this.isCartHidden = !this.isCartHidden;
    //if(!this.isCartHidden){
      //console.log(this.precioTotal)
      if(this.isOrdenSigue){
        this.precioTotal = 0;
        //debugger
      }
      
      //console.log(this.precioTotal)
    
  };

  constructor(protected usuarioService: UsuarioService){
    /* this.correoUsuario = this.usuarioService.getCorreoUsuario();
    console.log(this.correoUsuario); */
  };

  ngOnInit() {
    this.usuarioService.usuarioSesionAbierta$.subscribe((isSesionAbierta) => {
      this.isUsuarioSesionAbierta = isSesionAbierta;
    });
    this.usuarioService.precioTotal$.subscribe((precioTotal)=>{
      this.precioTotal = precioTotal;
      this.isOrdenSigue = true;
    })

    this.tourService.initialize(this.tourSteps, {});
    this.startTour();
    this.startTour();
    setTimeout(() => {
      this.startTour();
    }, 100);
    
  }

  startTour() {
    this.tourService.start();

  }

  mostrarProductosCarritoUsuario(){
    this.usuarioService.traerProductosCarritoUsuario().subscribe((response)=>{
      this.productosCarritoUsuario = response[0];
      this.productosCarritoUsuario.forEach(element => {

        element.precio = Number(element.precio);
        this.precioTotal += element.precio;

      });
    })
  }

  eliminarProducto(id: number){
    console.log(id)
    this.usuarioService.eliminarProductoUsuario(id).subscribe((response)=>{
      this.productosCarritoUsuario = response[0];
      this.productosCarritoUsuario.forEach(element => {
        element.precio = Number(element.precio);
        this.precioTotal += element.precio;

      });
    })
  }

  agregarOrden(){
    this.isOrdenSigue = false;
    console.log(this.precioTotal)
    this.usuarioService.setPrecioTotal(this.precioTotal)
    this.usuarioService.agregarOrden();
  }
 
}
