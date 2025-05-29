# 🔧 Solución Error PDF - Variables de Entorno Faltantes

## 🎯 **Problema Identificado**
El error `NOT_AUTHORIZED` al generar PDFs se debe a que falta la variable de entorno `AIRTABLE_TABLE_NAME_EMITIDAS` en tu configuración.

## ✅ **Solución Rápida**

### **Paso 1: Verificar tu archivo `.env.local`**
Abre tu archivo `.env.local` en la raíz del proyecto y asegúrate de que contiene **todas** estas variables:

```bash
# Configuración básica de Airtable
AIRTABLE_API_KEY=tu_api_key_actual
AIRTABLE_BASE_ID=tu_base_id_actual
AIRTABLE_API_URL=https://api.airtable.com/v0

# ⚠️ IMPORTANTE: Nombres exactos de las tablas en Airtable
AIRTABLE_TABLE_NAME_RECIBIDAS=nombre_tabla_facturas_recibidas
AIRTABLE_TABLE_NAME_EMITIDAS=nombre_tabla_facturas_emitidas
AIRTABLE_TABLE_NAME_CLIENTES=nombre_tabla_clientes

# Tablas fiscales (opcional)
AIRTABLE_TABLE_MODELO303=Modelo303
AIRTABLE_TABLE_MODELO111=Modelo111
AIRTABLE_TABLE_VENCIMIENTOS=VencimientosFiscales
AIRTABLE_TABLE_CONFIGURACION=ConfiguracionFiscal

# JWT Secret
JWT_SECRET=tu_jwt_secret_actual
```

### **Paso 2: Obtener el nombre exacto de tu tabla**

1. Ve a tu base de Airtable
2. Busca la tabla donde guardas las **facturas emitidas**
3. Copia el nombre **exacto** de la tabla (puede ser "Facturas emitidas", "FacturasEmitidas", "Emitidas", etc.)
4. Reemplaza `nombre_tabla_facturas_emitidas` con el nombre real

### **Paso 3: Verificar permisos**

Tu API Key de Airtable debe tener estos permisos:
- ✅ `data.records:read` - Para leer facturas
- ✅ `data.records:write` - Para crear/actualizar facturas
- ✅ Acceso a la base específica

### **Paso 4: Reiniciar el servidor**

Después de actualizar `.env.local`:

```bash
# Parar el servidor (Ctrl+C)
# Luego reiniciar
npm run dev
```

## 🔍 **Diagnóstico**

Si sigues teniendo problemas, revisa los logs del servidor. Ahora mostrarán información detallada:

```
🔍 Verificando configuración de Airtable para PDF:
- API Key presente: true/false
- Base ID presente: true/false  
- Tabla emitidas presente: true/false
- Nombre de tabla: [nombre actual]
```

## 🆘 **Problemas Comunes**

### **❌ Error: "Tabla no encontrada"**
- **Causa**: El nombre en `AIRTABLE_TABLE_NAME_EMITIDAS` no coincide con el nombre real en Airtable
- **Solución**: Copia el nombre exacto desde Airtable (sensible a mayúsculas y espacios)

### **❌ Error: "NOT_AUTHORIZED"**  
- **Causa**: El API Key no tiene permisos para la tabla
- **Solución**: Verificar permisos en el Personal Access Token

### **❌ Error: "Variable de entorno faltante"**
- **Causa**: Falta `AIRTABLE_TABLE_NAME_EMITIDAS` en `.env.local`
- **Solución**: Agregar la variable con el nombre correcto de la tabla

## 🎉 **Verificación**

Cuando esté todo configurado correctamente, verás en los logs:

```
📄 Generando PDF para factura ID: [id]
✅ Factura obtenida correctamente: [facturaID]  
📄 PDF generado exitosamente, tamaño: [bytes] bytes
```

## 🔗 **Enlaces Útiles**

- [Configuración de Airtable](./AIRTABLE_SETUP.md)
- [Documentación de PDFs](./PDF_FUNCIONALIDADES.md)
- [Airtable Personal Access Tokens](https://airtable.com/create/tokens)

¡Una vez configurado correctamente, podrás generar PDFs sin problemas! 🚀 