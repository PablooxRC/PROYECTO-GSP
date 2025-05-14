import {z} from 'zod'

export const signinSchema = z.object({
    email : z.string({
        required_error: 'El email es requerido',
        invalid_type_error: 'El email debe ser un texto'
    }).email({
        message: "El email debe ser un email valido "
    }),
    password: z.string({
        required_error: "La contraseña es requerida",
        invalid_type_error: "La contraseña deber ser un texto"
    }).min(6, {
        message: "La contraseña debe tener al menos 6 caracteres"
    }).max(255)
})

export const signupSchema= z.object({ 
     ci: z.number({ 
        required_error: "El CI es necesario",
        invalid_type_error: "El CI debe ser un número entero positivo "
     }).positive(),
    nombre: z.string({ 
        required_error: "El nombre es requerido",
        invalid_type_error: "El nombre debe ser un texto"
     }).min(1),
    apellido: z.string({ 
        required_error: "El apellido es requerido",
        invalid_type_error: "El apellido debe ser un texto"
     }).min(1),
    password: z.string({
        required_error: "La contraseña es requerida",
        invalid_type_error: "La contraseña deber ser un texto"
    }).min(6,{
        message: "La contraseña deberia tener al menos 6 caracteres"
    }).max(255),
    email : z.string({
        required_error: 'El email es requerido',
        invalid_type_error: 'El email debe ser un texto'
    }).email({
        message: "El email debe ser un email valido "
    }),
    unidad: z.string({ 
        required_error: "La unidad es requerido",
        invalid_type_error: "La unidad debe ser un texto"
     }).min(1),
})

export const updateSchema= z.object({ 
     ci: z.number({ 
        required_error: "El CI es necesario",
        invalid_type_error: "El CI debe ser un número entero positivo "
     }).int().positive().optional(),
    nombre: z.string({ 
        required_error: "El nombre es requerido",
        invalid_type_error: "El nombre debe ser un texto"
     }).min(1).optional(),
    apellido: z.string({ 
        required_error: "El apellido es requerido",
        invalid_type_error: "El apellido debe ser un texto"
     }).min(1).optional(),
    password: z.string({
        required_error: "La contraseña es requerida",
        invalid_type_error: "La contraseña deber ser un texto"
    }).min(6).max(255).optional(),
    email : z.string({
        required_error: 'El email es requerido',
        invalid_type_error: 'El email debe ser un texto'
    }).email({
        message: "El email debe ser un email valido "
    }).optional(),
    unidad: z.string({ 
        required_error: "La unidad es requerido",
        invalid_type_error: "La unidad debe ser un texto"
     }).min(1).optional()
})