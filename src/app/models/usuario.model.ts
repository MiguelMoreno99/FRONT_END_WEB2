export interface LoginRequest { //esto devuelve un Usuario o   // "Credenciales inválidas"
  email: string;
  password: string;
}

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

export interface RegistroRequest { //esto devuelve un UsuarioRespuesta o   // "El correo ya está registrado"
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  correo: string;
  contra: string;
  rol: string;
}

export interface EditRequest { //esto devuelve un UsuarioRespuesta tambien o   //  "Usuario no encontrado"
  correo: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  activo: boolean;
  favoritos?: {
    partidos: string[];
    equipos: string[];
  };
}

export interface UsuarioRespuesta {
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