import { Routes } from '@angular/router';
import { ConexionComponent } from './conexion/conexion.component';
import { HomePageComponent } from './home-page/home-page.component';
import { InisioSesionRegistroComponent } from './inisio-sesion-registro/inisio-sesion-registro.component';
import { InfoUsuarioComponent } from './info-usuario/info-usuario.component';
import{DashboardShonenComponent}from './dashboard-shonen/dashboard-shonen.component'
import { MangasComponent } from './mangas/mangas.component';
import { EnvioCompraComponent } from './envio-compra/envio-compra.component';
import { ProductoMangaComponent } from './producto-manga/producto-manga.component';

export const routes: Routes = [
  {path:'', component: HomePageComponent, title:'Home page'}, 
  {path:'conexion', component:ConexionComponent, title:'Conexion'},
  {path: 'inicio-de-sesion-registro', component:InisioSesionRegistroComponent, title: 'Inicio de Sesión'}, 
  {path: 'info-usuario', component: InfoUsuarioComponent, title: 'Información Usuario'}, 
  {path: 'dashboard-shonen', component: DashboardShonenComponent, title: 'Dashboard Shonen'},
  {path: 'mangas', component: MangasComponent, title: 'Seccion Mangas'},
  {path:'envio-compra', component: EnvioCompraComponent, title: 'Envio y compra'}, 
  {path: 'producto-mangas/:id', component: ProductoMangaComponent, title:'Información Producto'}
];
