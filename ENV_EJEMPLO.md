# Variables de Entorno para Sistema de Autenticación

## Agregar a tu .env.local:

```bash
# Tabla de usuarios en Airtable
AIRTABLE_TABLE_USUARIOS=Usuarios

# JWT Secret (OBLIGATORIO - mínimo 32 caracteres)
# Genera uno seguro aquí: https://generate-secret.vercel.app/32
JWT_SECRET=tu_secreto_jwt_super_seguro_de_minimo_32_caracteres_aqui_cambialo

# Variables de Airtable existentes (ya las tienes)
AIRTABLE_API_KEY=tu_api_key
AIRTABLE_BASE_ID=tu_base_id
AIRTABLE_API_URL=https://api.airtable.com/v0
```

## Importante:
1. **JWT_SECRET** debe tener al menos 32 caracteres
2. **No** uses el ejemplo de arriba, genera uno único
3. **Nunca** compartas tu JWT_SECRET en código público 