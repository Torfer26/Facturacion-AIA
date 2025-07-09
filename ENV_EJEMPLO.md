# =====================================================
# VARIABLES DE ENTORNO PARA FACTURACIÓNAIA
# =====================================================

## Para DESARROLLO (.env.local):

```bash
# =====================================================
# AUTENTICACIÓN
# =====================================================
JWT_SECRET=tu_secreto_jwt_super_seguro_de_minimo_64_caracteres_aqui_desarrollo
NEXTAUTH_URL=http://localhost:3000

# =====================================================
# AIRTABLE
# =====================================================
AIRTABLE_API_KEY=tu_api_key
AIRTABLE_BASE_ID=tu_base_id
AIRTABLE_API_URL=https://api.airtable.com/v0
AIRTABLE_TABLE_USUARIOS=Usuarios

# =====================================================
# EMAIL - CONFIGURACIÓN SIMPLE CON RESEND
# =====================================================
# OPCIÓN 1: RESEND API (RECOMENDADO - MÁS SIMPLE)
RESEND_API_KEY=re_tu_api_key_de_resend
RESEND_FROM_EMAIL="FacturacionAIA <noreply@tu-dominio.com>"

# OPCIÓN 2: RESEND VÍA SMTP (ALTERNATIVA)
# SMTP_HOST=smtp.resend.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=resend
# SMTP_PASS=re_tu_api_key_de_resend
# SMTP_FROM="FacturacionAIA <noreply@tu-dominio.com>"
```

## Para PRODUCCIÓN (.env.production):

```bash
# =====================================================
# SEGURIDAD CRÍTICA
# =====================================================
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# JWT Secret - OBLIGATORIO y DIFERENTE al de desarrollo
# Generar: openssl rand -base64 64
JWT_SECRET=TU_JWT_SECRET_DE_PRODUCCION_MINIMO_64_CARACTERES_COMPLETAMENTE_DIFERENTE

# URL de producción
NEXTAUTH_URL=https://tu-dominio.com

# =====================================================
# EMAIL - OBLIGATORIO PARA RESET DE CONTRASEÑAS
# =====================================================

# OPCIÓN 1: RESEND API (RECOMENDADO - 3K emails/mes gratis, más simple)
RESEND_API_KEY=re_tu_api_key_de_resend
RESEND_FROM_EMAIL="FacturacionAIA <noreply@tu-dominio.com>"

# OPCIÓN 2: RESEND VÍA SMTP (ALTERNATIVA)
# SMTP_HOST=smtp.resend.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=resend
# SMTP_PASS=re_tu_api_key_de_resend
# SMTP_FROM="FacturacionAIA <noreply@tu-dominio.com>"

# OPCIÓN 3: SENDGRID (100 emails/día gratis)
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=apikey
# SMTP_PASS=SG.tu_api_key_de_sendgrid
# SMTP_FROM="FacturacionAIA <noreply@tu-dominio.com>"

# OPCIÓN 4: MAILGUN (1K emails/mes gratis)
# SMTP_HOST=smtp.mailgun.org
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=postmaster@mg.tu-dominio.com
# SMTP_PASS=tu_password_mailgun
# SMTP_FROM="FacturacionAIA <noreply@tu-dominio.com>"

# =====================================================
# AIRTABLE
# =====================================================
AIRTABLE_API_KEY=tu_api_key_produccion
AIRTABLE_BASE_ID=tu_base_id_produccion
AIRTABLE_API_URL=https://api.airtable.com/v0
AIRTABLE_TABLE_USUARIOS=Usuarios

# =====================================================
# MONITOREO
# =====================================================
SENTRY_DSN=https://tu-sentry-dsn@sentry.io/proyecto

# =====================================================
# CONFIGURACIONES ADICIONALES
# =====================================================
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

## 🚀 CONFIGURACIÓN PARA PRODUCCIÓN:

### 1. **EMAIL SMTP (OBLIGATORIO)**
**RESEND (RECOMENDADO):**
1. Regístrate: https://resend.com
2. Copia tu API key
3. Configura las variables arriba

**SENDGRID:**
1. Regístrate: https://sendgrid.com  
2. Crea API key en Settings > API Keys
3. Usa la configuración comentada arriba

### 2. **JWT SECRET (OBLIGATORIO)**
```bash
# Generar secret seguro:
openssl rand -base64 64
```

### 3. **HTTPS/SSL (OBLIGATORIO)**
- Certificado SSL en tu servidor
- Cookies seguras requieren HTTPS

## ✅ CHECKLIST LANZAMIENTO:

- [ ] JWT_SECRET generado (64+ caracteres)
- [ ] Proveedor de email configurado (Resend/SendGrid)
- [ ] NEXTAUTH_URL con dominio HTTPS real
- [ ] Variables Airtable configuradas
- [ ] NODE_ENV=production
- [ ] SSL/HTTPS habilitado

## 🎯 COMANDOS ESENCIALES:

```bash
# Generar JWT Secret
openssl rand -base64 64

# Setup admin inicial  
npm run setup:admin
``` 