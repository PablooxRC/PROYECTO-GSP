import {z} from 'zod'

export const createScoutSchema = z.object({
    ci: z.number({ 
        required_error: "El CI es necesario",
        invalid_type_error: "El CI debe ser un número entero positivo "
     }).int().positive(),
    nombre: z.string({ 
        required_error: "El nombre es requerido",
        invalid_type_error: "El nombre debe ser un texto"
     }).min(1),
    apellido: z.string({ 
        required_error: "El apellido es requerido",
        invalid_type_error: "El nombre debe ser un texto"
     }).min(1),
    rama: z.string({ 
        required_error: "La rama es requerida",
         invalid_type_error: "La rama debe ser un texto"
     }).min(1),
    unidad: z.string({ 
        required_error: "La unidad es requerida",
         invalid_type_error:"La unidad debe ser un texto"
     }).min(1 ),
    etapa: z.string({ 
        required_error: "La etapa es requerida",
         invalid_type_error:"La etapa debe ser un texto"
    }).min(1 ),
});

export const updateScoutSchema = z.object({
    ci: z.number({ 
        required_error: "El CI es necesario",
        invalid_type_error: "El CI debe ser un número entero positivo "
     }).int().positive().optional(),
    nombre: z.string({ 
        required_error: "El nombre es requerido",
        invalid_type_error: "El nombre debe ser un texto"
     }).min(1).optional(),
    rama: z.string({ 
        required_error: "La rama es requerida",
         invalid_type_error: "La rama debe ser un texto"
     }).min(1).optional(),
    unidad: z.string({ 
        required_error: "La unidad es requerida",
         invalid_type_error:"La unidad debe ser un texto"
     }).min(1 ).optional(),
    etapa: z.string({ 
        required_error: "La etapa es requerida",
         invalid_type_error:"La etapa debe ser un texto"
    }).min(1 ).optional(),
});