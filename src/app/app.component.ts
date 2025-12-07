import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { UsuarioService } from './services/usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
  <header class="header"> 
    <div class="contenedor">
      <div class="logo">
        <a [routerLink]="['/']">
          <img src="https://betwarrior.com.mx/wp-content/uploads/sites/9/2024/05/Betwarrior-logo-cuadrado-convert.io-1.webp" alt="betwarrior Logo">
        </a>
      </div>

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
