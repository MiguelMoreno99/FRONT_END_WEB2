
export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  numeroCamiseta: number;
  posicion: string;
}

export interface JugadorCreate {
  id?: string;
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
  bandera: string;
  informacion: string;
  siglasEquipo: string;
  grupo: string;
  rankingFifa: number;
  fechaCreacion: string;
  jugadores: Jugador[];
}

export interface EquipoCreate {
  nombre: string;
  nombreCompletoPais: string;
  bandera: string;
  informacion: string;
  siglasEquipo: string;
  grupo: string;
  rankingFifa: number;
  jugadores: Jugador[];
}

export interface EquipoUpdate {
  nombre?: string;
  nombreCompletoPais?: string;
  bandera?: string;
  informacion?: string;
  grupo?: string;
  rankingFifa?: number;
}