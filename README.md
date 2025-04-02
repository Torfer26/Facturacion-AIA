# Facturación AIA

Sistema de gestión de facturas desarrollado con Next.js 14, TypeScript, y Tailwind CSS.

## Características

- 📄 Gestión de facturas con almacenamiento en Google Drive
- 🔍 Visualización y descarga de facturas
- 📊 Interfaz moderna y responsive
- 🌙 Soporte para modo oscuro
- 🔒 Integración con Airtable para almacenamiento de datos
- 🚀 Procesamiento automático de facturas con n8n

## Requisitos Previos

- Node.js 18 o superior
- Docker y Docker Compose
- Cuenta de Google Cloud Platform con API de Drive habilitada
- Cuenta de Airtable

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:password@postgres:5432/fiscalapp?schema=public"

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=fiscalapp

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
GOOGLE_CLIENT_EMAIL=your_client_email
GOOGLE_PRIVATE_KEY=your_private_key

# Airtable
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE_NAME=your_table_name
AIRTABLE_API_URL=https://api.airtable.com/v0
```

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Torfer26/Facturacion-AIA.git
   cd Facturacion-AIA
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el proyecto con Docker:
   ```bash
   docker-compose up -d
   ```

4. La aplicación estará disponible en http://localhost:3000

## Estructura del Proyecto

```
├── app/                    # Rutas y páginas de Next.js
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y servicios
├── prisma/               # Esquema y migraciones de la base de datos
├── public/               # Archivos estáticos
└── docker-compose.yml    # Configuración de Docker
```

## Tecnologías Utilizadas

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Google Drive API
- Airtable
- Docker
- n8n (para automatización)

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## Licencia

[MIT](LICENSE) 