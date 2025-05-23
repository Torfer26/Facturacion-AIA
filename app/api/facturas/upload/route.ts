import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'

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

export async function POST(request: Request) {
  try {
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
    const auth = getGoogleDriveAuth()
    const drive = google.drive({ version: 'v3', auth })

    // Procesar el archivo
    const formData = await request.formData()
    const file = formData.get('file') as File
    const tipo = formData.get('tipo') as string

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

    // Preparar el archivo para subir
    const fechaHora = getFechaHoraMadrid()
    const buffer = Buffer.from(await file.arrayBuffer())
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)

    // Subir a Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: `${tipo}_${fechaHora}_${file.name}`,
        mimeType: file.type,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
    })

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      fileName: `${tipo}_${fechaHora}_${file.name}`
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error al subir el archivo a Google Drive',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { 
      status: 500 
    })
  }
} 