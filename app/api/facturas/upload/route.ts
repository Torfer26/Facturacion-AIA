import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'
import { getUserFromRequest, logDataAccess } from '@/lib/utils/userFilters'
import { checkAuth } from '@/lib/utils/api-helpers'
import { requestInvoiceProcessing } from '@/lib/services/n8n'

// Configuración de Google Drive API
function getGoogleDriveAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('GOOGLE_PRIVATE_KEY no está configurada')
  }

  // Asegurarse de que la clave privada tenga el formato correcto
  const formattedKey = privateKey.replace(/\\n/g, '\n')

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: formattedKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
}

// Función para formatear la fecha y hora en zona horaria de Madrid
function getFechaHoraMadrid() {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  
  const formatter = new Intl.DateTimeFormat('es-ES', options)
  const parts = formatter.formatToParts(now)
  const fechaHora = parts
    .map(p => p.value)
    .join('')
    .replace(/\//g, '-')
    .replace(/:/g, '-')
    .replace(',', '')
    .replace(' ', '_')

  return fechaHora
}

export async function POST(request: NextRequest) {
  try {
    // 🔐 AÑADIR AUTENTICACIÓN
    console.log('[UPLOAD] Verificando autenticación...');
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      console.log('[UPLOAD] ❌ Usuario no autenticado');
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Convertir el usuario autenticado al formato UserInfo
    const user = {
      id: auth.user!.id,
      email: auth.user!.email,
      rol: (auth.user!.role?.toUpperCase() || 'USER') as 'ADMIN' | 'USER' | 'VIEWER'
    };

    console.log(`[UPLOAD] ✅ Usuario autenticado: ${user.email} (${user.id})`);
    logDataAccess(user, 'UPLOAD', 'factura-file');

    // Verificar las variables de entorno requeridas
    const requiredEnvVars = {
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
      GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Configuración incompleta. Faltan las siguientes variables: ${missingVars.join(', ')}` 
        },
        { status: 500 }
      )
    }

    // Inicializar Google Drive
    const auth_drive = getGoogleDriveAuth()
    const drive = google.drive({ version: 'v3', auth: auth_drive })

    // Procesar el archivo
    const formData = await request.formData()
    const file = formData.get('file') as File
    const tipo = formData.get('tipo') as string || 'factura-recibida'

    console.log(`[UPLOAD] Procesando archivo: ${file?.name} para usuario ${user.email}`);

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Tipo de archivo no permitido: ${file.type}. Solo se permiten PDF, JPG y PNG` 
        },
        { status: 400 }
      )
    }

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB en bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). El tamaño máximo es 10MB` 
        },
        { status: 400 }
      )
    }

    // Preparar el archivo para subir CON información del usuario
    const fechaHora = getFechaHoraMadrid()
    // 👤 Incluir ID del usuario en el nombre del archivo
    const userPrefix = user.email.split('@')[0] // Tomar la parte antes del @
    const fileName = `${tipo}_${userPrefix}_${fechaHora}_${file.name}`
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)

    console.log(`[UPLOAD] Subiendo archivo a Google Drive: ${fileName}`);

    // Subir a Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: file.type,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
        description: `Factura subida por ${user.email} (ID: ${user.id})`, // 👤 Metadatos del usuario
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
    })

    console.log(`[UPLOAD] ✅ Archivo subido exitosamente: ${response.data.id}`);

    // 🚀 INICIAR PROCESAMIENTO AUTOMÁTICO CON N8N
    try {
      console.log(`[UPLOAD] 🤖 Iniciando procesamiento automático con n8n...`);
      
      // Construir URL del archivo de Google Drive
      const fileUrl = `https://drive.google.com/file/d/${response.data.id}/view`;
      
      // Determinar el tipo de factura
      const tipoFactura = tipo.includes('emitida') ? 'EMITIDA' : 'RECIBIDA';
      
      // Solicitar procesamiento a n8n
      const processingResult = await requestInvoiceProcessing({
        invoiceId: response.data.id!, // Usar el ID del archivo como invoice ID temporal
        fileUrl: fileUrl,
        empresaId: user.id, // Usar el ID del usuario como empresa ID
        tipo: tipoFactura
      });

      if (processingResult.success) {
        console.log(`[UPLOAD] ✅ Procesamiento iniciado exitosamente:`, processingResult.message);
        
        return NextResponse.json({
          success: true,
          fileId: response.data.id,
          webViewLink: response.data.webViewLink,
          fileName: fileName,
          // 👤 Incluir información del usuario en la respuesta
          uploadedBy: {
            id: user.id,
            email: user.email
          },
          uploadDate: new Date().toISOString(),
          // 🤖 Información del procesamiento
          processing: {
            initiated: true,
            jobId: processingResult.jobId,
            message: processingResult.message
          }
        })
      } else {
        console.warn(`[UPLOAD] ⚠️ No se pudo iniciar el procesamiento automático:`, processingResult.message);
        
        // Aún así devolver éxito del upload, pero sin procesamiento
        return NextResponse.json({
          success: true,
          fileId: response.data.id,
          webViewLink: response.data.webViewLink,
          fileName: fileName,
          uploadedBy: {
            id: user.id,
            email: user.email
          },
          uploadDate: new Date().toISOString(),
          processing: {
            initiated: false,
            error: processingResult.message
          },
          warning: 'Archivo subido pero el procesamiento automático falló. Podrás procesarlo manualmente.'
        })
      }
    } catch (processingError) {
      console.error(`[UPLOAD] ❌ Error al iniciar procesamiento:`, processingError);
      
      // Devolver éxito del upload pero con warning sobre el procesamiento
      return NextResponse.json({
        success: true,
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
        fileName: fileName,
        uploadedBy: {
          id: user.id,
          email: user.email
        },
        uploadDate: new Date().toISOString(),
        processing: {
          initiated: false,
          error: processingError instanceof Error ? processingError.message : 'Error desconocido'
        },
        warning: 'Archivo subido pero el procesamiento automático falló. Podrás procesarlo manualmente.'
      })
    }

  } catch (error) {
    console.error('[UPLOAD] ❌ Error al subir archivo:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al subir el archivo a Google Drive',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { 
      status: 500 
    })
  }
} 