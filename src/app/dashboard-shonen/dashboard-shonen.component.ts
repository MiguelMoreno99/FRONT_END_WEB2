import { Component } from '@angular/core';
import { AdminMangasService } from '../admin-mangas.service';
import { CommonModule, NgFor} from '@angular/common';
import { RouterLink} from '@angular/router';
//Lo voy a ocupar como dashboard seinen
@Component({
  selector: 'app-dashboard-shonen',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-shonen.component.html',
  styleUrl: './dashboard-shonen.component.css'
})
export class DashboardShonenComponent {
  topProductos: any[] = [];
  generoSeinen:number = 3;
  constructor(private adminMangas: AdminMangasService){}

  ngOnInit(): void {
    
    this.adminMangas.topProductosCategoria(this.generoSeinen).subscribe((response)=>{
      this.topProductos = response[0];
    })
  }

  
}
