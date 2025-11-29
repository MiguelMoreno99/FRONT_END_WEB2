import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { BotonContactanosComponent } from './boton-contactanos/boton-contactanos.component';
import { UsuarioService } from './services/usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BotonContactanosComponent, RouterLink, CommonModule],
  template: `
  <header class="header"> 
    <div class="contenedor">
      <div class="logo">
        <a [routerLink]="['/']">
          <img src="https://betwarrior.com.mx/wp-content/uploads/sites/9/2024/05/Betwarrior-logo-cuadrado-convert.io-1.webp" alt="betwarrior Logo">
        </a>
      </div>
      
      <form>
        <div class="search">
            <input class="search-input" type="search" placeholder="Buscar en la Página">  
            <a style="color: black;" [routerLink]="['/info-usuario']">
              <i class="fa fa-search" aria-hidden="true"></i>
            </a>
        </div>
      </form>

      <div class="container-hero">
          <div class="hero">
              <div class="container-user">
                
                @if (usuarioService.isLoggedIn$ | async) {
                  <div class="infoUsuario">
                    <span>{{ usuarioService.obtenerInfoUsuario('correo') }}</span>
                  </div>
                  <a [routerLink]="['/info-usuario']" class="btn">
                    <i class="fa-solid fa-user"></i>
                  </a>
                } @else {
                  <a [routerLink]="['/inicio-de-sesion-registro']" class="btn">
                    <i class="fa-solid fa-user"></i>
                  </a>
                }

                <i class="fa-solid fa-cart-shopping"></i>
              </div>
          </div>
      </div>
    </div>
  </header>

  <div class="render-todo-menos-header">
    <router-outlet></router-outlet>
  </div>
  `,
  styleUrl: './app.component.css',
})

export class AppComponent {
  constructor(protected usuarioService: UsuarioService) {
  };
}
