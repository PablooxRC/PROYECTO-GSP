# 📋 SQL PARA INSERTAR DATOS EN TABLA PADRÓN

**Copia y pega en Railway Console:**

```sql
-- ============================================
-- INSERTAR DATOS EN TABLA PADRÓN
-- ============================================

INSERT INTO padron (ci, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, unidad, colegio, nivel_formacion, contacto_nombre, contacto_parentesco, contacto_celular)
VALUES
('10369755', 'Adrian', '', 'Destino', '', '2005-01-24', 'M', 'Unidad 1', 'Colegio A', 'Secundaria', 'Juan Destino', 'Padre', '099123456'),
('10551977', 'Marcelo', '', 'Villalpando', '', '2004-10-15', 'M', 'Unidad 2', 'Colegio B', 'Secundaria', 'María Villalpando', 'Madre', '099234567'),
('10966034', 'VIVIANA', '', 'RIOS', '', '2013-05-03', 'F', 'Unidad 1', 'Colegio A', 'Primaria', 'Carlos Rios', 'Padre', '099345678'),
('1106267', 'MATÍAS', '', 'LENERO', '', '2011-08-02', 'M', 'Unidad 3', 'Colegio C', 'Primaria', 'Pedro Lenero', 'Padre', '099456789'),
('12342808', 'JOSE', '', 'CAMACHO', '', '2011-04-18', 'M', 'Unidad 2', 'Colegio B', 'Primaria', 'Laura Camacho', 'Madre', '099567890'),
('12404745', 'ABRIL', '', 'ESQUIRROL', '', '2011-04-25', 'F', 'Unidad 1', 'Colegio A', 'Primaria', 'Roberto Esquirrol', 'Padre', '099678901'),
('12550685', 'CAMILA', '', 'TORREZ', '', '2001-07-27', 'F', 'Unidad 3', 'Colegio D', 'Secundaria', 'Ana Torrez', 'Madre', '099789012'),
('12712691', 'REGINA', '', 'REJAS', '', '2011-10-24', 'F', 'Unidad 2', 'Colegio B', 'Primaria', 'Miguel Rejas', 'Padre', '099890123'),
('12714542', 'ALEJANDRO', '', 'BALDERRAMA', '', '2014-03-01', 'M', 'Unidad 1', 'Colegio A', 'Primaria', 'Patricia Balderrama', 'Madre', '099901234'),
('12714543', 'ARIANA', '', 'BALDERRAMA', '', '2014-03-01', 'F', 'Unidad 1', 'Colegio A', 'Primaria', 'Patricia Balderrama', 'Madre', '099912345'),
('12714645', 'ISABEL', '', 'MENDOZA', '', '2009-03-06', 'F', 'Unidad 4', 'Colegio E', 'Secundaria', 'Diego Mendoza', 'Padre', '099023456'),
('12747428', 'ZOE', '', 'DE SOUZA', '', '2008-08-14', 'F', 'Unidad 3', 'Colegio C', 'Primaria', 'Fernando De Souza', 'Padre', '099134567'),
('12808580', 'LAURA', '', 'MENDIZABAL', '', '2007-12-11', 'F', 'Unidad 2', 'Colegio B', 'Secundaria', 'Víctor Mendizabal', 'Padre', '099245678')
ON CONFLICT (ci) DO NOTHING;

-- Verificar inserciones
SELECT COUNT(*) as "Total Registros en Padrón" FROM padron;

-- Ver algunos registros
SELECT ci, primer_nombre, primer_apellido, fecha_nacimiento, sexo FROM padron LIMIT 10;
```

---

## 🎯 PARA AGREGAR MÁS REGISTROS:

Si tienes más datos, simplemente agrega más líneas en el `VALUES`:

```sql
INSERT INTO padron (...)
VALUES
('11111111', 'NOMBRE', '', 'APELLIDO', '', '2010-01-01', 'M', 'Unidad', 'Colegio', 'Nivel', 'Contacto', 'Parentesco', '099123456'),
('22222222', 'OTRO', '', 'APELLIDO', '', '2012-05-15', 'F', 'Unidad', 'Colegio', 'Nivel', 'Contacto', 'Parentesco', '099987654')
ON CONFLICT (ci) DO NOTHING;
```

---

## 📊 CAMPOS DE LA TABLA:

- `ci`: Documento de identidad (VARCHAR 50, única clave)
- `primer_nombre`: Primer nombre
- `segundo_nombre`: Segundo nombre (puede ser '')
- `primer_apellido`: Primer apellido
- `segundo_apellido`: Segundo apellido (puede ser '')
- `fecha_nacimiento`: Formato YYYY-MM-DD
- `sexo`: 'M' o 'F'
- `unidad`: Nombre de la unidad scout
- `colegio`: Nombre del colegio
- `nivel_formacion`: Nivel (Primaria, Secundaria, etc.)
- `contacto_nombre`: Nombre del contacto de emergencia
- `contacto_parentesco`: Parentesco (Padre, Madre, Tío, etc.)
- `contacto_celular`: Teléfono de contacto

---

## ✅ PASOS:

1. **Copia el SQL completo de arriba**
2. **Pega en Railway Console**
3. **Presiona Enter**
4. **Verifica con el último SELECT**

¿Tienes más datos para insertar? Pásame y te creo los INSERTs 👇
