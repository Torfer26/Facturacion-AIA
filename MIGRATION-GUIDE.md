# 🔐 GUÍA DE MIGRACIÓN SEGURA - AUTENTICACIÓN V2

## ⚠️ IMPORTANTE: LEE ANTES DE CONTINUAR

Esta migración implementa un sistema de autenticación seguro con:
- ✅ Hash de contraseñas con bcrypt
- ✅ JWT seguros con secretos robustos
- ✅ Validación estricta con Zod
- ✅ Logging profesional con Winston
- ✅ Base de datos PostgreSQL con Prisma
- ✅ Sistema de roles (ADMIN, USER, VIEWER)

## 📋 PASOS DE MIGRACIÓN (ORDEN OBLIGATORIO)

### 1. **Configurar Variables de Entorno**
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus valores reales:
# - NEXTAUTH_SECRET (mínimo 32 caracteres)
# - JWT_SECRET (mínimo 32 caracteres)
# - DATABASE_URL (PostgreSQL)
# - ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
```

### 2. **Instalar Dependencias**
```bash
npm install
```

### 3. **Configurar Base de Datos**
```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar esquema a la base de datos
npm run db:push

# O usar migraciones (recomendado para producción)
npm run db:migrate
```

### 4. **Crear Usuario Administrador**
```bash
npm run setup:admin
```

### 5. **Verificar Configuración**
- ✅ Base de datos conectada
- ✅ Usuario admin creado
- ✅ Variables de entorno configuradas

## 🔑 CREDENCIALES INICIALES

Después de ejecutar `npm run setup:admin`:
- **Email**: admin@facturas.com (o tu ADMIN_EMAIL)
- **Contraseña**: Admin123@Facturas (o tu ADMIN_PASSWORD)

**⚠️ CAMBIA LA CONTRASEÑA INMEDIATAMENTE DESPUÉS DEL PRIMER LOGIN**

## 👥 SISTEMA DE USUARIOS MULTI-TENANT

### Roles Disponibles:
- **ADMIN**: Acceso completo + gestión de usuarios
- **USER**: Acceso completo a facturas
- **VIEWER**: Solo lectura

### Crear Nuevos Usuarios:
1. Login como ADMIN
2. Ir a "Gestión de Usuarios"
3. Crear usuario con email único
4. Asignar rol apropiado
5. El usuario recibirá credenciales temporales

### Aislamiento de Entornos:
- Cada usuario tiene acceso solo a sus datos
- Los ADMIN pueden ver todos los datos
- Los VIEWER solo pueden consultar

## 🛡️ CARACTERÍSTICAS DE SEGURIDAD

### Contraseñas:
- Mínimo 8 caracteres
- Al menos 1 mayúscula, 1 minúscula, 1 número, 1 especial
- Hash con bcrypt (12 rounds)

### JWT:
- Expiración: 7 días
- Algoritmo: HS256
- Issuer/Audience validation

### Logging:
- Winston para logs estructurados
- Niveles: error, warn, info, http, debug
- Archivos separados en producción

## 🚀 ACTIVAR NUEVA AUTENTICACIÓN

Una vez completada la migración:

1. **Cambiar flag en .env:**
```bash
ENABLE_NEW_AUTH=true
```

2. **Reiniciar aplicación:**
```bash
npm run dev
```

3. **Probar login con credenciales admin**

## 🔄 ROLLBACK (Si algo sale mal)

```bash
# Desactivar nueva autenticación
ENABLE_NEW_AUTH=false

# Reiniciar aplicación
npm run dev
```

## 📞 SOPORTE

Si tienes problemas durante la migración:
1. Revisa los logs en `logs/`
2. Verifica variables de entorno
3. Confirma conexión a base de datos
4. Contacta al equipo de desarrollo

---

**🎯 OBJETIVO**: Migración sin pérdida de acceso y con máxima seguridad