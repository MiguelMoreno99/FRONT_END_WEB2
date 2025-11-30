export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  numeroCamiseta: number;
  posicion: string;
}

export interface Equipo {
  id: string;
  nombre: string;
  nombreCompletoPais: string;
  bandera?: string;
  informacion?: string;
  siglasEquipo?: string;
  grupo?: string;
  rankingFifa?: number;
  fechaCreacion?: string;
  jugadores?: Jugador[];
}

export interface Partido {
  id: string;
  equipoA: Equipo;
  equipoB: Equipo;
  golesEquipoA: number;
  golesEquipoB: number;
  fecha: string;
  estadio: string;
  ciudad: string;
  estado: string;
  fase: string;
  grupo: string;
  arbitroPrincipal: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}