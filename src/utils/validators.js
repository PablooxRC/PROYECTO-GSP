/**
 * Funciones de validación reutilizables
 */

import { ValidationError } from './errorHandler.js';

/**
 * Valida que un email sea válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que una contraseña sea segura
 * - Mínimo 6 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 */
export const isStrongPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

/**
 * Valida que sea un CI válido (número)
 */
export const isValidCI = (ci) => {
  return Number.isInteger(parseInt(ci)) && parseInt(ci) > 0;
};

/**
 * Valida que sea un teléfono válido
 */
export const isValidPhone = (phone) => {
  // Formato: +598 99 123456 o 099123456
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{2,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Valida que sea una URL válida
 */
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida que sea una fecha válida
 */
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Valida que un valor esté dentro de opciones permitidas
 */
export const isInEnum = (value, enumValues) => {
  return enumValues.includes(value);
};

/**
 * Validador de longitud de string
 */
export const hasValidLength = (str, min = 1, max = 255) => {
  if (typeof str !== 'string') return false;
  const length = str.trim().length;
  return length >= min && length <= max;
};

/**
 * Validador de objeto no vacío
 */
export const isObjectNotEmpty = (obj) => {
  return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
};

/**
 * Función genérica para validar y capturar errores
 */
export const validateField = (value, fieldName, validators) => {
  for (const [validator, errorMessage] of Object.entries(validators)) {
    let isValid = false;
    
    switch (validator) {
      case 'required':
        isValid = value !== null && value !== undefined && value !== '';
        break;
      case 'email':
        isValid = isValidEmail(value);
        break;
      case 'password':
        isValid = value && value.length >= 6;
        break;
      case 'strongPassword':
        isValid = isStrongPassword(value);
        break;
      case 'ci':
        isValid = isValidCI(value);
        break;
      case 'phone':
        isValid = isValidPhone(value);
        break;
      case 'url':
        isValid = isValidURL(value);
        break;
      case 'date':
        isValid = isValidDate(value);
        break;
      case 'minLength':
        isValid = value && value.length >= errorMessage;
        break;
      case 'maxLength':
        isValid = value && value.length <= errorMessage;
        break;
      default:
        continue;
    }

    if (!isValid) {
      throw new ValidationError(errorMessage, fieldName);
    }
  }
};

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/[<>]/g, '')
    .replace(/'/g, "''");
};

/**
 * Sanitiza un objeto
 */
export const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};
