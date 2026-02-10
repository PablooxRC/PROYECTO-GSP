import { z } from 'zod'

export const createRegistroSchema = z.object({
    scout_ci: z.number({
        required_error: "El CI del scout es requerido",
        invalid_type_error: "El CI debe ser un número"
    }).int().positive(),
    unidad: z.string().optional(),
    etapa_progresion: z.string().optional(),
    colegio: z.string().optional(),
    curso: z.string().optional(),
    numero_deposito: z.string().optional(),
    fecha_deposito: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD").optional(),
    monto: z.number().nonnegative().optional(),
    envio: z.string().optional(),
    contacto_parentesco: z.string().optional(),
    contacto_nombre: z.string().optional(),
    contacto_celular: z.string().optional(),
})

export const updateRegistroSchema = z.object({
    scout_ci: z.number().int().positive().optional(),
    unidad: z.string().optional(),
    etapa_progresion: z.string().optional(),
    colegio: z.string().optional(),
    curso: z.string().optional(),
    numero_deposito: z.string().optional(),
    fecha_deposito: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    monto: z.number().nonnegative().optional(),
    envio: z.string().optional(),
    contacto_parentesco: z.string().optional(),
    contacto_nombre: z.string().optional(),
    contacto_celular: z.string().optional(),
})
