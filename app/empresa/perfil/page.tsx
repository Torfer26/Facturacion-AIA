"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEmpresaProfile } from '@/lib/hooks/useEmpresaProfile';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function EmpresaPerfilPage() {
  const { empresa, loading, updating, saveEmpresa, uploadLogo, isConfigured } = useEmpresaProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nombre: '',
    cif: '',
    razonSocial: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    provincia: '',
    pais: 'España',
    telefono: '',
    email: '',
    web: '',
    datosBancarios: {
      banco: '',
      iban: '',
      swift: '',
      titular: ''
    },
    tipoSociedad: 'limitada' as 'anonima' | 'limitada' | 'cooperativa' | 'autonomo' | 'otros',
    periodoLiquidacion: 'trimestral' as 'mensual' | 'trimestral',
    regimenEspecial: '',
    codigoActividad: '',
    epigrafeIAE: '',
    ejercicioFiscal: {
      inicio: '01-01',
      fin: '31-12'
    },
    numeracionFacturas: {
      prefijo: 'F',
      siguienteNumero: 1,
      digitos: 4
    },
    logo: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    if (empresa) {
      setFormData({
        nombre: empresa.nombre || '',
        cif: empresa.cif || '',
        razonSocial: empresa.razonSocial || '',
        direccion: empresa.direccion || '',
        codigoPostal: empresa.codigoPostal || '',
        ciudad: empresa.ciudad || '',
        provincia: empresa.provincia || '',
        pais: empresa.pais || 'España',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        web: empresa.web || '',
        datosBancarios: {
          banco: empresa.datosBancarios?.banco || '',
          iban: empresa.datosBancarios?.iban || '',
          swift: empresa.datosBancarios?.swift || '',
          titular: empresa.datosBancarios?.titular || ''
        },
        tipoSociedad: empresa.tipoSociedad || 'limitada',
        periodoLiquidacion: empresa.periodoLiquidacion || 'trimestral',
        regimenEspecial: empresa.regimenEspecial || '',
        codigoActividad: empresa.codigoActividad || '',
        epigrafeIAE: empresa.epigrafeIAE || '',
        ejercicioFiscal: empresa.ejercicioFiscal || {
          inicio: '01-01',
          fin: '31-12'
        },
        numeracionFacturas: empresa.numeracionFacturas || {
          prefijo: 'F',
          siguienteNumero: 1,
          digitos: 4
        },
        logo: empresa.logo || ''
      });
      
      if (empresa.logo) {
        setLogoPreview(empresa.logo);
      }
    }
  }, [empresa]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as any,
        [field]: value
      }
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let logoUrl = empresa?.logo;
      
      // Subir logo si hay uno nuevo
      if (logoFile) {
        try {
          logoUrl = await uploadLogo(logoFile);
        } catch (error) {
          console.warn('Error subiendo logo:', error);
          // Continúar sin logo
        }
      }

      await saveEmpresa({
        ...formData,
        logo: logoUrl
      });

      toast({
        title: 'Éxito',
        description: isConfigured ? 'Perfil actualizado correctamente' : 'Perfil creado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el perfil de empresa',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Cargando perfil...</h2>
            <p className="text-gray-500">Obteniendo configuración de empresa</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Perfil de Empresa</h1>
          <p className="text-gray-500 mt-2">
            {isConfigured ? 'Gestiona los datos de tu empresa' : 'Configura los datos de tu empresa'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos Básicos */}
        <Card>
          <CardHeader>
            <CardTitle>Datos Básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre Comercial *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cif">CIF *</Label>
                <Input
                  id="cif"
                  value={formData.cif}
                  onChange={(e) => handleInputChange('cif', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="razonSocial">Razón Social</Label>
              <Input
                id="razonSocial"
                value={formData.razonSocial}
                onChange={(e) => handleInputChange('razonSocial', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logo de Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              {logoPreview && (
                <div className="w-20 h-20 border rounded-lg overflow-hidden">
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                </div>
              )}
              <div>
                <Label htmlFor="logo">Logo de Empresa</Label>
                <div className="space-y-2">
                  {empresa?.logo && (
                    <div className="flex items-center space-x-4">
                      <img 
                        src={empresa.logo} 
                        alt="Logo preview" 
                        className="w-16 h-16 object-contain border rounded"
                        onError={(e) => {
                          console.error('Error cargando imagen:', empresa.logo);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="text-sm">
                        <p className="text-gray-600">URL actual:</p>
                        <p className="font-mono text-xs break-all">{empresa.logo}</p>
                        <p className="text-orange-600 text-xs mt-1">
                          ⚠️ Para que aparezca en PDFs, usa una URL directa como: https://i.ibb.co/ABC123/imagen.png
                        </p>
                      </div>
                    </div>
                  )}
                  <Input
                    id="logo"
                    type="url"
                    placeholder="https://i.ibb.co/ABC123/logo.png"
                    value={formData.logo || ''}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">
                    📝 Formatos soportados: JPG, PNG, SVG. Tamaño recomendado: 200x200px
                  </p>
                  <p className="text-xs text-blue-600">
                    💡 Para obtener una URL directa de ImgBB: sube tu imagen → clic derecho en la imagen → "Copiar dirección de enlace"
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        <Card>
          <CardHeader>
            <CardTitle>Dirección</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codigoPostal">Código Postal</Label>
                <Input
                  id="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="provincia">Provincia</Label>
                <Input
                  id="provincia"
                  value={formData.provincia}
                  onChange={(e) => handleInputChange('provincia', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="web">Página Web</Label>
              <Input
                id="web"
                value={formData.web}
                onChange={(e) => handleInputChange('web', e.target.value)}
                placeholder="https://www.tuempresa.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Datos Bancarios */}
        <Card>
          <CardHeader>
            <CardTitle>Datos Bancarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="banco">Nombre del Banco</Label>
                <Input
                  id="banco"
                  value={formData.datosBancarios.banco}
                  onChange={(e) => handleNestedInputChange('datosBancarios', 'banco', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="titular">Titular de la Cuenta</Label>
                <Input
                  id="titular"
                  value={formData.datosBancarios.titular}
                  onChange={(e) => handleNestedInputChange('datosBancarios', 'titular', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.datosBancarios.iban}
                  onChange={(e) => handleNestedInputChange('datosBancarios', 'iban', e.target.value)}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                />
              </div>
              <div>
                <Label htmlFor="swift">SWIFT (opcional)</Label>
                <Input
                  id="swift"
                  value={formData.datosBancarios.swift}
                  onChange={(e) => handleNestedInputChange('datosBancarios', 'swift', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración Fiscal */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Fiscal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipoSociedad">Tipo de Sociedad</Label>
                <Select
                  value={formData.tipoSociedad}
                  onValueChange={(value) => handleInputChange('tipoSociedad', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limitada">Sociedad Limitada</SelectItem>
                    <SelectItem value="anonima">Sociedad Anónima</SelectItem>
                    <SelectItem value="autonomo">Autónomo</SelectItem>
                    <SelectItem value="cooperativa">Cooperativa</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="periodoLiquidacion">Período de Liquidación</Label>
                <Select
                  value={formData.periodoLiquidacion}
                  onValueChange={(value) => handleInputChange('periodoLiquidacion', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="mensual">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigoActividad">Código de Actividad</Label>
                <Input
                  id="codigoActividad"
                  value={formData.codigoActividad}
                  onChange={(e) => handleInputChange('codigoActividad', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="epigrafeIAE">Epígrafe IAE</Label>
                <Input
                  id="epigrafeIAE"
                  value={formData.epigrafeIAE}
                  onChange={(e) => handleInputChange('epigrafeIAE', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Facturas */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Facturas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prefijo">Prefijo</Label>
                <Input
                  id="prefijo"
                  value={formData.numeracionFacturas.prefijo}
                  onChange={(e) => handleNestedInputChange('numeracionFacturas', 'prefijo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="siguienteNumero">Siguiente Número</Label>
                <Input
                  id="siguienteNumero"
                  type="number"
                  value={formData.numeracionFacturas.siguienteNumero}
                  onChange={(e) => handleNestedInputChange('numeracionFacturas', 'siguienteNumero', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="digitos">Dígitos</Label>
                <Input
                  id="digitos"
                  type="number"
                  value={formData.numeracionFacturas.digitos}
                  onChange={(e) => handleNestedInputChange('numeracionFacturas', 'digitos', parseInt(e.target.value))}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Ejemplo: {formData.numeracionFacturas.prefijo}{formData.numeracionFacturas.siguienteNumero.toString().padStart(formData.numeracionFacturas.digitos, '0')}
            </p>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={updating}>
            {updating ? 'Guardando...' : (isConfigured ? 'Actualizar Perfil' : 'Crear Perfil')}
          </Button>
        </div>
      </form>
    </div>
  );
} 