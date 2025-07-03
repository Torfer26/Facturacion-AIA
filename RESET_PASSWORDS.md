# 🔐 Guía para Restablecer Contraseñas

## 📋 Opciones Disponibles

Tienes **3 formas** de cambiar contraseñas en tu sistema:

### **Opción 1: Reset Rápido del Admin (Más Fácil)**

```bash
npm run reset-admin-password
```

**¿Qué hace?**
- Busca automáticamente `admin@facturas.com`
- Le pone contraseña: `Admin123@New2024!`
- Listo para usar inmediatamente

### **Opción 2: Reset Interactivo (Más Flexible)**

```bash
# Con contraseña personalizada
npm run reset-password admin@facturas.com MiNuevaPassword123@

# Con contraseña automática (generada aleatoriamente)
npm run reset-password admin@facturas.com
```

**¿Qué hace?**
- Permite especificar cualquier email
- Puedes elegir la contraseña o que se genere automáticamente
- Funciona con cualquier usuario

### **Opción 3: Cambiar desde Airtable (Manual)**

1. Ve a tu base de Airtable
2. Tabla "Usuarios"
3. Busca el usuario
4. Genera nuevo hash de contraseña
5. Actualiza el campo "Password"

---

## 🚀 Uso Recomendado

### **Si olvidaste la contraseña del admin:**

```bash
# 1. Ejecutar script rápido
npm run reset-admin-password

# 2. Usar las nuevas credenciales:
#    Email: admin@facturas.com
#    Contraseña: Admin123@New2024!

# 3. Cambiar la contraseña desde la aplicación
```

### **Si necesitas resetear otro usuario:**

```bash
# Con contraseña personalizada
npm run reset-password usuario@ejemplo.com NuevaPassword123@

# O que se genere automáticamente
npm run reset-password usuario@ejemplo.com
```

---

## 🔧 Verificar que Funciona

### **1. Ejecutar el Script**

```bash
npm run reset-admin-password
```

**Salida esperada:**
```
🔄 Buscando usuario admin...
✅ Usuario admin encontrado: {
  id: 'rec123...',
  email: 'admin@facturas.com',
  nombre: 'Admin',
  rol: 'ADMIN'
}
🔄 Actualizando contraseña...
✅ Contraseña actualizada exitosamente!

📝 NUEVAS CREDENCIALES:
   Email: admin@facturas.com
   Contraseña: Admin123@New2024!

🔐 Recuerda cambiar esta contraseña después del primer login
```

### **2. Probar Login**

```bash
# Iniciar servidor
npm run dev

# Ir a: http://localhost:3001/login
# Usar: admin@facturas.com / Admin123@New2024!
```

---

## ❌ Solución de Problemas

### **Error: "Usuario admin no encontrado"**

**Causas posibles:**
1. El email en Airtable es diferente
2. No hay usuario admin creado
3. Variables de entorno incorrectas

**Solución:**
```bash
# Ver qué usuarios hay en Airtable
# Opción A: Cambiar el email en el script
# Opción B: Usar el script interactivo con el email correcto
npm run reset-password tu-email-real@ejemplo.com
```

### **Error: "Error al actualizar la contraseña"**

**Causas posibles:**
1. Conexión a Airtable fallida
2. Permisos de API insuficientes
3. Variables de entorno (.env) incorrectas

**Solución:**
```bash
# Verificar variables de entorno
echo $AIRTABLE_API_KEY
echo $AIRTABLE_BASE_ID

# Verificar conexión a Airtable
npm run dev
# Si el login normal funciona, la conexión está bien
```

### **Error: "Module not found"**

**Solución:**
```bash
# Instalar dependencias
npm install

# Verificar que tsx esté instalado
npm list tsx
```

---

## 🔍 Ver Usuarios Existentes

Si no estás seguro de qué usuarios tienes, puedes:

1. **Ir a Airtable** directamente
2. **Abrir tu base de datos**
3. **Ver tabla "Usuarios"**
4. **Revisar la columna "Email"**

O crear un script para listar usuarios (si lo necesitas).

---

## 📝 Resumen de Comandos

```bash
# Reset rápido del admin
npm run reset-admin-password

# Reset de cualquier usuario
npm run reset-password email@ejemplo.com
npm run reset-password email@ejemplo.com nueva-password

# Ver ayuda del script interactivo
npm run reset-password
```

**¿Cuál prefieres usar para resetear tu contraseña?** 