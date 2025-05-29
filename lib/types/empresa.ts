export interface EmpresaProfile {
  id: string;
  // Datos básicos
  nombre: string;
  cif: string;
  razonSocial: string;
  
  // Dirección
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
  pais: string;
  
  // Contacto
  telefono?: string;
  email?: string;
  web?: string;
  
  // Datos bancarios
  datosBancarios: {
    banco: string;
    iban: string;
    swift?: string;
    titular: string;
  };
  
  // Diseño y marca
  logo?: string; // URL del logo
  colorPrimario?: string;
  colorSecundario?: string;
  
  // Datos fiscales
  tipoSociedad: 'anonima' | 'limitada' | 'cooperativa' | 'autonomo' | 'otros';
  periodoLiquidacion: 'mensual' | 'trimestral';
  regimenEspecial?: string;
  codigoActividad: string;
  epigrafeIAE: string;
  ejercicioFiscal: {
    inicio: string; // "01-01"
    fin: string; // "31-12"
  };
  
  // Configuración de facturas
  numeracionFacturas: {
    prefijo: string;
    siguienteNumero: number;
    digitos: number; // Ej: 4 para 0001
  };
  
  // Metadatos
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmpresaProfileDTO extends Omit<EmpresaProfile, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateEmpresaProfileDTO extends Partial<CreateEmpresaProfileDTO> {} 