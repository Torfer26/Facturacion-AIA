# Configuración de Airtable para Sistema Fiscal

## Variables de Entorno Requeridas

Crear archivo `.env.local` en la raíz del proyecto:

```bash
AIRTABLE_API_KEY=tu_api_key_aqui
AIRTABLE_BASE_ID=tu_base_id_aqui
AIRTABLE_API_URL=https://api.airtable.com/v0
```

## Estructura de Tablas Requeridas

### 1. Tabla: **Modelo303**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Ejercicio | Number | Año fiscal (ej: 2024) |
| Trimestre | Number | 1, 2, 3 o 4 |
| Estado | Single Select | borrador, presentado, rectificativa |
| FechaPresentacion | Date | Fecha de presentación |
| VentasExentas | Number | Ventas exentas de IVA |
| VentasGravadas21 | Number | Base imponible 21% |
| IvaRepercutido21 | Number | IVA repercutido 21% |
| VentasGravadas10 | Number | Base imponible 10% |
| IvaRepercutido10 | Number | IVA repercutido 10% |
| VentasGravadas4 | Number | Base imponible 4% |
| IvaRepercutido4 | Number | IVA repercutido 4% |
| TotalIvaRepercutido | Number | Total IVA repercutido |
| ComprasGravadas21 | Number | Compras base 21% |
| IvaSoportado21 | Number | IVA soportado 21% |
| ComprasGravadas10 | Number | Compras base 10% |
| IvaSoportado10 | Number | IVA soportado 10% |
| ComprasGravadas4 | Number | Compras base 4% |
| IvaSoportado4 | Number | IVA soportado 4% |
| TotalIvaSoportado | Number | Total IVA soportado |
| DiferenciaIva | Number | Diferencia (repercutido - soportado) |
| CompensacionesAnterior | Number | Compensaciones de períodos anteriores |
| ResultadoLiquidacion | Number | Resultado final |
| Observaciones | Long text | Observaciones |

### 2. Tabla: **Modelo111**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Ejercicio | Number | Año fiscal |
| Trimestre | Number | 1, 2, 3 o 4 |
| Estado | Single Select | borrador, presentado, rectificativa |
| FechaPresentacion | Date | Fecha de presentación |
| NumeroPerceptoresTrabajo | Number | Número de perceptores trabajo |
| ImporteRetribucionesTrabajo | Number | Importe retribuciones trabajo |
| RetencionesIngresadasTrabajo | Number | Retenciones trabajo |
| NumeroPerceptoresProfesional | Number | Número perceptores profesional |
| ImporteRetribucionesProfesional | Number | Importe retribuciones profesional |
| RetencionesIngresadasProfesional | Number | Retenciones profesional |
| NumeroPerceptoresPremios | Number | Número perceptores premios |
| ImportePremios | Number | Importe premios |
| RetencionesIngresadasPremios | Number | Retenciones premios |
| TotalRetenciones | Number | Total retenciones |
| TotalAIngresar | Number | Total a ingresar |
| Observaciones | Long text | Observaciones |

### 3. Tabla: **VencimientosFiscales**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Modelo | Single line text | Número de modelo (303, 111, 200, etc.) |
| Descripcion | Single line text | Descripción del vencimiento |
| FechaVencimiento | Date | Fecha límite |
| Periodo | Single line text | Período al que corresponde |
| Estado | Single Select | pendiente, presentado, pagado |
| Importe | Number | Importe a pagar (opcional) |
| Observaciones | Long text | Observaciones |

### 4. Tabla: **ConfiguracionFiscal**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| CIF | Single line text | CIF de la empresa |
| RazonSocial | Single line text | Razón social |
| PeriodoLiquidacion | Single Select | trimestral, mensual |
| RegimenEspecial | Single line text | Régimen especial aplicable |
| TipoSociedad | Single Select | limitada, anonima, autonomo |
| EjercicioInicio | Single line text | Inicio ejercicio (01-01) |
| EjercicioFin | Single line text | Fin ejercicio (31-12) |
| CodigoActividad | Single line text | Código de actividad |
| EpigrafeIAE | Single line text | Epígrafe IAE |

## Datos de Ejemplo

### Modelo303 (ejemplo)
- Ejercicio: 2024
- Trimestre: 1
- Estado: presentado
- VentasGravadas21: 10000
- IvaRepercutido21: 2100
- ComprasGravadas21: 5000
- IvaSoportado21: 1050
- TotalIvaRepercutido: 2100
- TotalIvaSoportado: 1050
- DiferenciaIva: 1050
- ResultadoLiquidacion: 1050

### VencimientosFiscales (ejemplo)
- Modelo: 303
- Descripcion: IVA Primer Trimestre 2024
- FechaVencimiento: 2024-04-20
- Periodo: 1T 2024
- Estado: pendiente
- Importe: 1050

## Permisos Requeridos

El Personal Access Token debe tener:
- `data.records:read` - Para leer datos
- `data.records:write` - Para crear/actualizar datos
- Acceso a la base específica

## Verificación

Una vez configurado, visita `/fiscal` en tu aplicación para verificar que los datos se cargan correctamente. 