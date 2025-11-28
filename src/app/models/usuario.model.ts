export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  correo: string;
  rol: string;
  fechaRegistro: string;
  activo: boolean;
  favoritos?: {
    partidos: string[];
    equipos: string[];
  };
  token?: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  correo: string;
  contra: string;
  rol: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}