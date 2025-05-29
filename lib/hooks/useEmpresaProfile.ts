'use client';

import { useState, useEffect } from 'react';
import { EmpresaProfile, CreateEmpresaProfileDTO, UpdateEmpresaProfileDTO } from '@/lib/types/empresa';
import { getAuthToken } from './useAuth';

export function useEmpresaProfile() {
  const [empresa, setEmpresa] = useState<EmpresaProfile | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updating, setUpdating] = useState(false);

  // Obtener TODAS las empresas disponibles
  const fetchAllEmpresas = async () => {
    try {
      console.log('🏢 useEmpresaProfile: Obteniendo todas las empresas...');
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      
      const response = await fetch('/api/empresa/perfil/all', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        // Si no existe el endpoint /all, usar el normal y convertir a array
        console.log('🏢 Endpoint /all no existe, usando endpoint normal');
        const empresaData = await fetchEmpresaSingle();
        if (empresaData) {
          setEmpresas([empresaData]);
          setEmpresa(empresaData);
          console.log('🏢 Empresa convertida a array:', [empresaData]);
          return [empresaData];
        }
        return [];
      }
      
      const data = await response.json();
      console.log('🏢 useEmpresaProfile: Todas las empresas recibidas:', data);
      
      if (data.success && data.empresas) {
        setEmpresas(data.empresas);
        // Seleccionar la primera empresa por defecto
        if (data.empresas.length > 0) {
          setEmpresa(data.empresas[0]);
        }
      }
      
      return data.empresas || [];
    } catch (err) {
      console.error('🏢 Error obteniendo todas las empresas:', err);
      setError(err as Error);
      
      // Fallback al método normal
      const empresaData = await fetchEmpresaSingle();
      if (empresaData) {
        setEmpresas([empresaData]);
        setEmpresa(empresaData);
        return [empresaData];
      }
      return [];
    } finally {
      setLoading(false);
      console.log('🏢 useEmpresaProfile: Loading terminado');
    }
  };

  // Función auxiliar para obtener UNA empresa (renombrada para claridad)
  const fetchEmpresaSingle = async (): Promise<EmpresaProfile | null> => {
    try {
      console.log('🏢 useEmpresaProfile: Iniciando fetchEmpresaSingle...');
      const token = getAuthToken();
      
      console.log('🏢 useEmpresaProfile: Token obtenido:', !!token);
      
      const response = await fetch('/api/empresa/perfil', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      console.log('🏢 useEmpresaProfile: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Error fetching empresa profile');
      }
      
      const data = await response.json();
      console.log('🏢 useEmpresaProfile: Data recibida:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch empresa profile');
      }
      
      console.log('🏢 useEmpresaProfile: Empresa obtenida:', data.empresa?.nombre);
      return data.empresa;
    } catch (err) {
      console.error('🏢 useEmpresaProfile: Error fetching empresa profile:', err);
      return null;
    }
  };

  // Crear o actualizar perfil de empresa
  const saveEmpresa = async (empresaData: CreateEmpresaProfileDTO | UpdateEmpresaProfileDTO) => {
    try {
      setUpdating(true);
      const token = getAuthToken();
      
      const response = await fetch('/api/empresa/perfil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(empresaData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error saving empresa profile');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save empresa profile');
      }
      
      setEmpresa(data.empresa);
      setError(null);
      
      return data.empresa;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Subir logo
  const uploadLogo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const token = getAuthToken();
    const response = await fetch('/api/empresa/logo', {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error uploading logo');
    }
    
    const data = await response.json();
    return data.logoUrl;
  };

  // Generar datos bancarios formateados para PDFs
  const getDatosBancariosFormateados = () => {
    if (!empresa?.datosBancarios) return '';
    
    const { banco, iban, titular } = empresa.datosBancarios;
    return `${banco}\nIBAN: ${iban}\nTitular: ${titular}`;
  };

  // Obtener información básica para facturas
  const getEmpresaInfoForPDF = () => {
    if (!empresa) {
      return {
        nombre: "Tu Empresa S.L.",
        cif: "B12345678",
        direccion: "Dirección no configurada",
        telefono: "",
        email: "",
        web: "",
        datosBancarios: ""
      };
    }

    return {
      nombre: empresa.nombre || empresa.razonSocial,
      cif: empresa.cif,
      direccion: `${empresa.direccion}\n${empresa.codigoPostal} ${empresa.ciudad}, ${empresa.provincia}`,
      telefono: empresa.telefono,
      email: empresa.email,
      web: empresa.web,
      datosBancarios: getDatosBancariosFormateados(),
      logo: empresa.logo
    };
  };

  useEffect(() => {
    console.log('🏢 useEmpresaProfile: useEffect ejecutándose...');
    fetchAllEmpresas();
  }, []);

  // Función para seleccionar una empresa específica
  const selectEmpresa = (empresaId: string) => {
    const empresaSeleccionada = empresas.find(emp => emp.id === empresaId);
    if (empresaSeleccionada) {
      setEmpresa(empresaSeleccionada);
      console.log('🏢 Empresa seleccionada:', empresaSeleccionada.nombre);
    }
  };

  return {
    empresa,
    empresas,
    loading,
    error,
    updating,
    saveEmpresa,
    uploadLogo,
    refreshEmpresa: fetchEmpresaSingle,
    selectEmpresa,
    getDatosBancariosFormateados,
    getEmpresaInfoForPDF,
    // Helper para verificar si está configurado
    isConfigured: !!empresa?.nombre && !!empresa?.cif,
  };
} 