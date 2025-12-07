import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { InicioSesionRegistroComponent } from './inicio-sesion-registro/inicio-sesion-registro.component';
import { InfoUsuarioComponent } from './info-usuario/info-usuario.component';
import { PartidosComponent } from './partidos/partidos.component';
import { EquiposComponent } from './equipos/equipos.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'Home page' },
  { path: 'inicio-de-sesion-registro', component: InicioSesionRegistroComponent, title: 'Inicio de Sesión' },
  { path: 'info-usuario', component: InfoUsuarioComponent, title: 'Información Usuario' },
  { path: 'partidos', component: PartidosComponent, title: 'Partidos' },
  { path: 'equipos', component: EquiposComponent, title: 'Equipos' },
];
