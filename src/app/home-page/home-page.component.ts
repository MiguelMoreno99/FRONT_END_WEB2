import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterOutlet, RouterLink } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FontAwesomeModule, RouterLink, RouterOutlet],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

  usuarioActual: Usuario | null = null;

  constructor(private usuarioService: UsuarioService) { };

  ngOnInit(): void {
    this.usuarioService.currentUser$.subscribe({
      next: (usuario) => {
        this.usuarioActual = usuario;
      },
      error: (err) => console.log('Error al obtener usuario.')
    });
  }
}
