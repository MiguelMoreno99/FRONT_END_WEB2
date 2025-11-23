import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDbService } from '../admin-db.service';

@Component({
  selector: 'app-conexion',
  standalone: true,
  imports: [CommonModule],
  template: `
  *<ul>
 <!-- Use *ngFor directive to loop over the data array -->
 <li *ngFor="let item of data">
 <h3>{{ item.tipo}}</h3> <!-- Display the name of the item -->
 <p>{{ item.idCategoria}}</p> <!-- Display the item's description -->
 </li>
</ul>
  `,
  styleUrl: './conexion.component.css'
})
export class ConexionComponent {
  data: any[] = []; // Property to store the data
  
  constructor(private dataService: AdminDbService) {} // Inject the data service
  
  ngOnInit(): void {
  this.dataService.getData().subscribe((data) => {
  this.data = data; // Assign the received data to the property
  }, (error) => {
  console.error('There was an error retrieving data:', error);
  });
  }

}

/*<ul>
 <!-- Use *ngFor directive to loop over the data array -->
 <li *ngFor="let item of data">
 <h3>{{ item.idCategoria}}</h3> <!-- Display the name of the item -->
 <p>{{ item.TIPO }}</p> <!-- Display the item's description -->
 </li>
</ul> */
