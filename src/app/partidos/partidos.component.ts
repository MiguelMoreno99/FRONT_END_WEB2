import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { PartidoService } from '../services/partidos.service';
import { Partido } from '../models/partido.model';

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, NgFor],
  templateUrl: './partidos.component.html',
  styleUrl: './partidos.component.css'
})
export class PartidosComponent implements OnInit {
  // lista con campo extra stadiumImage para la vista
  public partidosView: Array<Partido & { stadiumImage: string }> = [];

  // ruta de imágenes de estadios: agrega tus archivos en src/assets/img/estadios/
  private stadiumImages = [
   'assets/img/estadios/estadio1.jpg',
    'assets/img/estadios/estadio2.jpg',
    'assets/img/estadios/estadio3.jpg',
    'assets/img/estadios/estadio4.jpg'
  ];

  constructor(private partidoService: PartidoService) {}

  ngOnInit(): void {
    this.loadPartidos();
  }

  private loadPartidos() {
    this.partidoService.getPartidos().subscribe({
      next: (list) => {
        this.partidosView = list.map(p => ({
          ...p,
          stadiumImage: this.randomImage()
        }));
          console.log('Partidos cargados:', this.partidosView);
      },
      error: (err) => {
        console.error('Error cargando partidos', err);
      }
    });
  }

  private randomImage(): string {
    if (!this.stadiumImages.length) return '';
    const i = Math.floor(Math.random() * this.stadiumImages.length);
    return this.stadiumImages[i];
  }
}
