/**
 * Middleware y funciones para validación de roles y permisos
 */

import { AuthorizationError } from './errorHandler.js';

/**
 * Verifica si el usuario es administrador
 * @param {Object} req - Request object
 * @returns {boolean} - True si es admin
 */
export const isAdmin = (req) => {
  return req.isAdmin === true;
};

/**
 * Verifica si el usuario es el propietario del recurso
 * @param {number} resourceOwnerId - CI del propietario del recurso
 * @param {number} userCI - CI del usuario autenticado
 * @returns {boolean}
 */
export const isOwner = (resourceOwnerId, userCI) => {
  return resourceOwnerId === userCI;
};

/**
 * Middleware para verificar que sea admin
 */
export const requireAdmin = (req, res, next) => {
  if (!isAdmin(req)) {
    throw new AuthorizationError('Se requiere permisos de administrador');
  }
  next();
};

/**
 * Middleware para verificar que sea propietario o admin
 * @param {string} ownerField - Campo del objeto que contiene el ID del propietario
 */
export const requireOwnerOrAdmin = (ownerField = 'dirigente_ci') => {
  return (req, res, next) => {
    const resourceOwnerId = req.body?.[ownerField] || req.params?.[ownerField] || req.resource?.[ownerField];
    
    if (!isAdmin(req) && !isOwner(resourceOwnerId, req.userCI)) {
      throw new AuthorizationError('No tienes acceso a este recurso');
    }
    next();
  };
};

/**
 * Roles disponibles
 */
export const ROLES = {
  ADMIN: 'admin',
  DIRIGENTE: 'dirigente',
  SCOUT: 'scout',
};

/**
 * Obtiene el rol del usuario basado en sus permisos
 */
export const getUserRole = (req) => {
  if (isAdmin(req)) {
    return ROLES.ADMIN;
  }
  return ROLES.DIRIGENTE;
};
