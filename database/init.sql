CREATE TABLE scouts(
    ci VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    rama VARCHAR(255) NOT NULL,
    unidad VARCHAR(255) NOT NULL,
    etapa VARCHAR(255) NOT NULL,
    nivel_actual VARCHAR(255),
    logros INTEGER,
    apellido VARCHAR(255)
);

CREATE TABLE dirigente (
    ci INTEGER PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    apellido VARCHAR(200) NOT NULL,
    unidad VARCHAR(200) NOT NULL,
    password VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upadate_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gravatar VARCHAR(250)
);

ALTER TABLE scouts ADD COLUMN dirigente_ci INTEGER REFERENCES dirigente(ci);