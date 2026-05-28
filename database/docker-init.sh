#!/bin/bash
# =============================================================
# Script de inicialización de base de datos para Docker
# Se ejecuta automáticamente al crear el contenedor de Postgres
# (colocado en /docker-entrypoint-initdb.d/)
# =============================================================
set -e

MIGRATIONS_DIR="/docker-entrypoint-initdb.d/migrations"

echo "==> Ejecutando schema inicial..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -f "$MIGRATIONS_DIR/init.sql"

echo "==> Aplicando migraciones en orden..."

migrations=(
  "migration_change_dirigente_ci_type.sql"
  "migration_auto_increment_dirigente_ci.sql"
  "migration_change_scout_ci_type.sql"
  "migration_change_scouts_ci_type.sql"
  "migration_expand_ci_varchar.sql"
  "migration_add_create_at_scouts.sql"
  "migration_add_fields_dirigente.sql"
  "migration_add_is_admin_dirigente.sql"
  "migration_add_cargos_dirigente.sql"
  "migration_add_profesion_ocupacion_dirigente.sql"
  "migration_add_es_colaborador_dirigente.sql"
  "migration_add_deposito_dirigente.sql"
  "migration_add_envio_dirigente.sql"
  "migration_email_optional.sql"
  "migration_create_registros_table.sql"
  "migration_change_registros_dirigente_ci_type.sql"
  "migration_add_envio_field.sql"
  "migration_change_envio_type.sql"
  "migration_add_hora_deposito_registros.sql"
  "migration_add_admin_registrado.sql"
  "migration_create_padron.sql"
  "migration_create_perfiles.sql"
  "migration_create_report_logs.sql"
  "migration_scouts_campos_nuevos.sql"
  "migration_seed_admin_and_patron.sql"
)

for migration in "${migrations[@]}"; do
  file="$MIGRATIONS_DIR/$migration"
  if [ -f "$file" ]; then
    echo "  -> $migration"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$file"
  else
    echo "  [WARN] No encontrado: $migration — omitido"
  fi
done

echo "==> Base de datos inicializada correctamente."
