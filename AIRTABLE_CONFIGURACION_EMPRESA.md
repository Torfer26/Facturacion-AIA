# 🏢 Configuración de Tabla de Empresa en Airtable

## 📋 **Instrucciones para Configurar tu Tabla de Empresa**

### **Paso 1: Crear Nueva Tabla en Airtable**

1. Ve a tu base de Airtable existente
2. Haz clic en **"+ Add a table"**
3. Nombra la tabla: **`ConfiguracionEmpresa`**

### **Paso 2: Configurar Campos de la Tabla**

Crea los siguientes campos en tu tabla `ConfiguracionEmpresa`:

#### **📊 Campos Básicos de Empresa**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `Nombre` | Single line text | Nombre comercial de tu empresa |
| `CIF` | Single line text | CIF/NIF de la empresa |
| `RazonSocial` | Single line text | Razón social oficial |

#### **📍 Datos de Dirección**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `Direccion` | Single line text | Dirección completa |
| `CodigoPostal` | Single line text | Código postal |
| `Ciudad` | Single line text | Ciudad |
| `Provincia` | Single line text | Provincia |
| `Pais` | Single line text | País (por defecto: España) |

#### **📞 Datos de Contacto**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `Telefono` | Single line text | Teléfono de contacto |
| `Email` | Email | Email de la empresa |
| `Web` | URL | Página web |

#### **🏦 Datos Bancarios**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `Banco` | Single line text | Nombre del banco |
| `IBAN` | Single line text | IBAN completo |
| `SWIFT` | Single line text | Código SWIFT (opcional) |
| `TitularCuenta` | Single line text | Titular de la cuenta |

#### **🎨 Diseño y Marca**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `Logo` | URL | URL del logo de la empresa |
| `ColorPrimario` | Single line text | Color primario (hex) |
| `ColorSecundario` | Single line text | Color secundario (hex) |

#### **📋 Datos Fiscales**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `TipoSociedad` | Single select | limitada, anonima, autonomo, cooperativa, otros |
| `PeriodoLiquidacion` | Single select | trimestral, mensual |
| `RegimenEspecial` | Single line text | Régimen especial aplicable |
| `CodigoActividad` | Single line text | Código de actividad económica |
| `EpigrafeIAE` | Single line text | Epígrafe del IAE |
| `EjercicioInicio` | Single line text | Inicio ejercicio (01-01) |
| `EjercicioFin` | Single line text | Fin ejercicio (31-12) |

#### **🧾 Configuración de Facturas**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `PrefijoFacturas` | Single line text | Prefijo para numeración (ej: F) |
| `SiguienteNumeroFactura` | Number | Siguiente número de factura |
| `DigitosFactura` | Number | Número de dígitos (ej: 4 para 0001) |

### **Paso 3: Configurar Variables de Entorno**

Agrega a tu archivo `.env.local`:

```bash
# Configuración de empresa en Airtable
AIRTABLE_TABLE_CONFIGURACION=ConfiguracionEmpresa
```

### **Paso 4: Crear Primer Registro de Empresa**

En tu tabla `ConfiguracionEmpresa`, crea **un solo registro** con tus datos:

#### **Ejemplo de Registro:**
```
Nombre: Mi Empresa S.L.
CIF: B12345678
RazonSocial: Mi Empresa Sociedad Limitada
Direccion: Calle Mayor 123
CodigoPostal: 28001
Ciudad: Madrid
Provincia: Madrid
Pais: España
Telefono: +34 91 123 45 67
Email: info@miempresa.com
Web: https://www.miempresa.com
Banco: Banco Santander
IBAN: ES91 2100 0418 4502 0005 1332
TitularCuenta: Mi Empresa S.L.
TipoSociedad: limitada
PeriodoLiquidacion: trimestral
CodigoActividad: 6201
EpigrafeIAE: 831
EjercicioInicio: 01-01
EjercicioFin: 31-12
PrefijoFacturas: F
SiguienteNumeroFactura: 1
DigitosFactura: 4
```

### **Paso 5: Verificar Configuración**

1. **Reinicia tu aplicación** después de agregar las variables de entorno
2. Ve a `/empresa/perfil` en tu aplicación
3. Deberías ver tus datos cargados automáticamente
4. Si no hay datos, podrás crearlos desde la interfaz

## 🎯 **Funcionalidades que Obtienes**

### **✅ En PDFs de Facturas:**
- ✅ **Logo de empresa** en el header
- ✅ **Datos reales** de tu empresa
- ✅ **Datos bancarios** automáticos
- ✅ **Información de contacto** completa

### **✅ En el Sistema:**
- ✅ **Configuración centralizada** de empresa
- ✅ **Subida de logo** desde la interfaz
- ✅ **Gestión de datos bancarios**
- ✅ **Configuración fiscal** completa
- ✅ **Numeración automática** de facturas

## 🔧 **Solución de Problemas**

### **❌ Error: "No hay configuración de empresa"**
- Verifica que la tabla `ConfiguracionEmpresa` existe
- Asegúrate de tener al menos un registro en la tabla
- Revisa que `AIRTABLE_TABLE_CONFIGURACION` está en `.env.local`

### **❌ PDF muestra datos por defecto**
- Verifica que los campos en Airtable coinciden exactamente con los nombres de arriba
- Comprueba que hay un registro en la tabla `ConfiguracionEmpresa`
- Reinicia la aplicación después de cambios en `.env.local`

### **❌ Logo no aparece en PDF**
- Sube el logo desde `/empresa/perfil`
- Verifica que la URL del logo es accesible públicamente
- El logo debe estar en formato JPG, PNG, GIF, WebP o SVG

## 📈 **Próximos Pasos**

1. **Configura tu empresa** en `/empresa/perfil`
2. **Sube tu logo** de empresa
3. **Configura datos bancarios** para facturas
4. **Prueba generar un PDF** para verificar que todo funciona
5. **Personaliza colores** y diseño (próximamente)

---

**¡Listo!** 🎉 Ahora tu sistema usará los datos reales de tu empresa en lugar de valores por defecto. 