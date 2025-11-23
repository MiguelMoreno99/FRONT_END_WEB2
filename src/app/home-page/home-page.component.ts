import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterOutlet, RouterLink } from '@angular/router';
import { provideRouter } from '@angular/router';
import { DashboardShonenComponent } from '../dashboard-shonen/dashboard-shonen.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FontAwesomeModule, RouterLink, RouterOutlet, DashboardShonenComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
 
}
