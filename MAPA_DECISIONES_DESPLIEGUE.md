# 🗺️ MAPA DE DECISIONES: CÓMO DESPLEGAR TU SISTEMA GRATIS

**Elige tu ruta según tu situación**

---

## 1️⃣ ¿TIENES DOMINIO PERSONALIZADO?

```
┌─────────────────────────────────────────┐
│ ¿Necesitas dominio propio?              │
└─────────────────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
   SÍ             NO
    │             │
    ▼             ▼
 [A]          [B]
```

### Opción A: Con Dominio Personalizado Gratis

- **Dominio**: FreeDomain.tk (gratis por 12 meses)
- **Backend**: Oracle Cloud
- **Frontend**: Netlify
- **URL Final**: `https://api.tudominio.tk` + `https://tudominio.tk`
- **Tiempo**: +15 minutos adicionales
- **Dificultad**: Media

### Opción B: Sin Dominio (Usar IPs + Netlify)

- **Backend**: IP de Oracle Cloud
- **Frontend**: URL automática de Netlify
- **URL Final**: `http://150.203.35.120` + `https://scout-app-2025.netlify.app`
- **Tiempo**: 60 minutos
- **Dificultad**: Fácil ⭐ RECOMENDADO

---

## 2️⃣ ¿QUÉ CONOCIMIENTO TIENES?

```
┌──────────────────────────────────────┐
│ Nivel de experiencia técnica         │
└──────────────────────────────────────┘
    │              │              │
   SIN          BASICO          AVANZADO
  IDEA
    │              │              │
    ▼              ▼              ▼
 [RUTA 1]      [RUTA 2]      [RUTA 3]
```

### RUTA 1: Sin experiencia técnica

**Leer primero**: 📄 `DESPLIEGUE_RAPIDO_60MIN.md`

- Sigue paso a paso
- Copia y pega comandos
- Máximo 2 horas
- ✅ Recomendado para ti

### RUTA 2: Experiencia básica

**Leer primero**: 📄 `GUIA_DESPLIEGUE_GRATUITO_COMPLETO.md`

- Entiende cada paso
- Puedes personalizarlo
- Aprovecha todas las features

### RUTA 3: Experiencia avanzada

**Opciones extras**:

- Docker en Oracle Cloud
- Kubernetes (overkill para este proyecto)
- CI/CD con GitHub Actions
- Monitoreo con Prometheus

---

## 3️⃣ ¿CUÁL ES TU PRIORIDAD?

```
VELOCIDAD        →  DESPLIEGUE_RAPIDO_60MIN.md
FACILIDAD        →  DESPLIEGUE_RAPIDO_60MIN.md
DOCUMENTACIÓN    →  GUIA_DESPLIEGUE_GRATUITO_COMPLETO.md
SEGURIDAD        →  GUIA_DESPLIEGUE_GRATUITO_COMPLETO.md (Fase 4)
ESCALABILIDAD    →  Consulta Fase 6 (Futuro)
```

---

## 4️⃣ TABLA COMPARATIVA: OPCIONES DE HOSTING GRATIS

| Opción                  | Backend      | Frontend     | BD         | Dominio    | Uptime | Mejor para      |
| ----------------------- | ------------ | ------------ | ---------- | ---------- | ------ | --------------- |
| **Oracle + Netlify** ⭐ | Oracle Cloud | Netlify      | PostgreSQL | .tk gratis | 99.5%  | Producción real |
| **Railway**             | Railway      | Netlify      | PostgreSQL | Igual      | 99%    | MVP rápido      |
| **Render**              | Render       | Netlify      | PostgreSQL | Igual      | 99%    | Testing         |
| **Vercel**              | No backend   | Vercel       | N/A        | Gratis     | 99.99% | Solo frontend   |
| **GitHub Pages**        | Externo      | GitHub Pages | Externo    | .github.io | 99.99% | Doc estática    |

---

## 5️⃣ FLUJO DECISIÓN FINAL

```
                    QUIERO DESPLEGAR GRATIS
                            │
                            ▼
                    ¿TENGO GITHUB?
                      │        │
                     SÍ        NO
                      │        └─→ Crear en github.com
                      ▼
                    ¿HE USADO SSH?
                    │        │
                   NO        SÍ
                    │        │
                    ▼        ▼
              🔽📄 Lee:   🚀 Ve directo
            DESPLIEGUE_   a FASE 2
            RAPIDO_60MIN  (crear VM)
                    │
                    ▼
          ¿NECESITAS DOMINIO?
            │        │
           SÍ        NO
            │        │
            ▼        ▼
         Registrar  Usa IP+Netlify
         .tk en      (más simple)
         Freenom
            │        │
            └────┬───┘
                 ▼
           🎯 LISTO PARA
              PRODUCCIÓN
```

---

## 6️⃣ ESTIMACIÓN DE TIEMPO (HORAS)

### Opción A: Rápida (SIN dominio personalizado)

```
✓ Crear Oracle Cloud        15 min
✓ SSH y configurar VM        20 min
✓ Instalar dependencias      15 min
✓ Desplegar backend          10 min
✓ Desplegar frontend         10 min
─────────────────────────
  TOTAL:                     70 min (~1 hora)
```

### Opción B: Completa (CON dominio personalizado + seguridad)

```
✓ Todo de Opción A           70 min
✓ Registrar dominio .tk      10 min
✓ Configurar DNS             10 min
✓ SSL/HTTPS                  15 min
✓ Nginx + Firewall           15 min
─────────────────────────
  TOTAL:                    120 min (~2 horas)
```

---

## 7️⃣ COSTO TOTAL COMPARATIVA

| Elemento         | Costo  | Proveedor                  |
| ---------------- | ------ | -------------------------- |
| VM (1vCPU, 1GB)  | $0     | Oracle Cloud (Always Free) |
| PostgreSQL       | $0     | Incluido en VM             |
| Frontend Hosting | $0     | Netlify                    |
| Dominio .tk      | $0     | Freenom                    |
| SSL/HTTPS        | $0     | Let's Encrypt              |
| **TOTAL MES**    | **$0** |                            |
| **TOTAL AÑO**    | **$0** |                            |

---

## 8️⃣ ARQUITECTURA FINAL

```
┌─────────────────────────────────────────┐
│     USUARIOS EN INTERNET                │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐ ┌─────────┐ ┌────────────┐
│Partner │ │ Scouts  │ │ Dirigentes │
│ (Web)  │ │  App    │ │ (Mobile)   │
└────┬───┘ └────┬────┘ └──────┬─────┘
     │          │             │
     └──────────┼─────────────┘
                │
    NETLIFY FRONTEND
    https://scout-app.netlify.app
          (React + Vite)
                │
                │ API Calls
                │
                ▼
         NGINX + SSL (Certificado Gratis)
         150.203.35.120 (IP Oracle Cloud)
                │
    ┌───────────┴────────────┐
    │   EXPRESS + NODE.JS    │
    │  (Puerto 3000)         │
    └───────────┬────────────┘
                │
                ▼
    ┌──────────────────────┐
    │  PostgreSQL (Puerto  │
    │  5432 - Local Only)  │
    │                      │
    │ 50GB Storage + Datos │
    └──────────────────────┘

Ubicación: Oracle Cloud (Asia-Pacific u otros)
Backup: Manual semanal a local
```

---

## 9️⃣ PASO 0: ANTES DE EMPEZAR - CHECKLIST

```
REQUISITOS PREVIOS:
□ Correo de Gmail activo
□ Tarjeta de crédito (para verificación Oracle, NO se cobra)
□ Git instalado en tu máquina
□ Proyecto en GitHub (público o privado)
□ Terminal/PowerShell disponible
□ Ancho de banda de internet (mín 2MB/s)

ARCHIVOS QUE NECESITAS EN GITHUB:
□ Backend en /
□ Frontend en /frontend
□ Database scripts en /database
□ Scripts en /scripts
□ .gitignore configurado
```

---

## 🔟 DECISIÓN FINAL: ¿QUÉ DOCUMENTO LEO PRIMERO?

### 👉 SI TIENES PRISA (1 hora):

**Lee**: `DESPLIEGUE_RAPIDO_60MIN.md`

- Sigue comando a comando
- No explica por qué, solo qué
- ✅ Más rápido

### 👉 SI QUIERES ENTENDER TODO:

**Lee**: `GUIA_DESPLIEGUE_GRATUITO_COMPLETO.md`

- Explica cada paso
- Incluye seguridad
- ✅ Mejor para futuro mantenimiento

### 👉 SI NECESITAS AYUDA PERSONALIZADA:

**Abre**: Esta carpeta + PROBLEMAS_Y_SOLUCIONES.md

- Busca tu problema
- Encuentra solución específica
- ✅ Debugging efectivo

---

## 🎯 PRÓXIMA ACCIÓN

```
1. Lee este documento (5 min) ✓ LO ACABAS DE HACER
2. Elige tu ruta según tabla de arriba (1 min)
3. Lee el documento seleccionado (5-30 min)
4. Sigue paso a paso (60-120 min)
5. ¡Celebra! 🎉
```

---

## 📌 LINKS IMPORTANTES

- **Oracle Cloud**: https://www.oracle.com/cloud/free/
- **Netlify**: https://netlify.com
- **Freenom (Dominios)**: https://www.freenom.com
- **Let's Encrypt (SSL)**: https://letsencrypt.org
- **Node.js**: https://nodejs.org
- **PostgreSQL**: https://www.postgresql.org

---

## 💬 FRASE MOTIVACIONAL

> _"Despliegue gratis no significa sacrificar calidad. Con Oracle Cloud + Netlify obtienes infraestructura de clase empresarial sin pagar ni un peso."_

**¡Vamos a hacerlo! 🚀**

---

## RESUMEN: ELIGE UNO

```
┌─────────────────────────────────────┐
│ REALMENTe QUIERO COMENZAR AHORA     │
│                                     │
│ 👉 DESPLIEGUE_RAPIDO_60MIN.md      │
│                                     │
│ (Haz esto y en 1 hora está online) │
└─────────────────────────────────────┘
```
