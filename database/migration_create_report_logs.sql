-- Tabla para registrar envíos de reportes por admin
CREATE TABLE IF NOT EXISTS report_logs (
  id SERIAL PRIMARY KEY,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_by INTEGER REFERENCES dirigente(ci),
  "from" DATE,
  "to" DATE,
  recipient_email VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_report_logs_sent_at ON report_logs(sent_at);
