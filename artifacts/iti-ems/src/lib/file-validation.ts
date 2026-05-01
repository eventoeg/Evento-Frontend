export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['application/pdf']
  const ALLOWED_EXTENSIONS = ['.pdf']
  
  // Check file size
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }
  
  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PDF files are allowed' }
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))
  if (!hasValidExtension) {
    return { valid: false, error: 'Only PDF files are allowed' }
  }
  
  // Additional security checks
  if (fileName.includes('..') || fileName.includes('/')) {
    return { valid: false, error: 'Invalid file name' }
  }
  
  return { valid: true }
}

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .toLowerCase()
}

export const generateSecureFileName = (originalName: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const sanitized = sanitizeFileName(originalName)
  const nameWithoutExt = sanitized.replace(/\.[^/.]+$/, '')
  const extension = sanitized.split('.').pop()
  
  return `${nameWithoutExt}_${timestamp}_${randomString}.${extension}`
}