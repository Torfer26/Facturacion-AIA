import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export interface UploadFileParams {
  folderId: string;
  fileName: string;
  mimeType: string;
  fileContent: Buffer;
}

export interface FileMetadata {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
}

/**
 * Sube un archivo a Google Drive
 */
export async function uploadFile({ folderId, fileName, mimeType, fileContent }: UploadFileParams): Promise<FileMetadata> {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: fileContent,
      },
      fields: 'id,name,mimeType,webViewLink,createdTime,size',
    });

    return response.data as FileMetadata;
  } catch (error) {
    throw new Error('No se pudo subir el archivo a Google Drive');
  }
}

/**
 * Lista archivos de una carpeta específica en Google Drive
 */
export async function listFiles(folderId: string): Promise<FileMetadata[]> {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id,name,mimeType,webViewLink,createdTime,size)',
    });

    return response.data.files as FileMetadata[];
  } catch (error) {
    throw new Error('No se pudieron listar los archivos de Google Drive');
  }
}

/**
 * Crea una carpeta en Google Drive
 */
export async function createFolder(folderName: string, parentFolderId?: string): Promise<string> {
  try {
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    const response = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return response.data.id as string;
  } catch (error) {
    throw new Error('No se pudo crear la carpeta en Google Drive');
  }
}

/**
 * Genera una URL para autorización OAuth
 */
export function getAuthUrl(): string {
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

/**
 * Intercambia el código de autorización por tokens de acceso y refresco
 */
export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Establece los tokens para autenticación
 */
export function setTokens(accessToken: string, refreshToken?: string) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}



export async function uploadInvoice(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/facturas/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Error al subir el archivo');
  }

  return data;
}
