export interface Usuario {
  usuario: {
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
  }
  token?: string;
  message?: string;
  rol?: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  correo: string;
  contra: string;
  rol: string;
}

export interface EditRequest {
  correo: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  activo: string;
  favoritos?: {
    partidos: string[];
    equipos: string[];
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}