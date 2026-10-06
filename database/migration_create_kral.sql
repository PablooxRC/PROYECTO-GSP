BEGIN;
CREATE TABLE IF NOT EXISTS kral_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
  external BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS kral_materials (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL REFERENCES kral_locations(id),
  reference VARCHAR(50) NOT NULL DEFAULT '',
  name VARCHAR(250) NOT NULL CHECK (length(trim(name)) > 0),
  category VARCHAR(160) NOT NULL DEFAULT '',
  unit VARCHAR(160) NOT NULL,
  measure VARCHAR(80) NOT NULL DEFAULT 'unidad',
  total NUMERIC(12,3) NOT NULL CHECK (total >= 0),
  available NUMERIC(12,3) NOT NULL CHECK (available >= 0 AND available <= total),
  notes TEXT NOT NULL DEFAULT '',
  source_key TEXT UNIQUE
);
CREATE TABLE IF NOT EXISTS kral_requests (
  id SERIAL PRIMARY KEY,
  requester_ci VARCHAR(50) NOT NULL,
  unit VARCHAR(160) NOT NULL,
  place VARCHAR(250) NOT NULL,
  purpose TEXT NOT NULL,
  use_at TIMESTAMPTZ NOT NULL,
  return_at TIMESTAMPTZ NOT NULL CHECK (return_at >= use_at),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','returned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_by VARCHAR(50),
  decided_at TIMESTAMPTZ,
  decision_note TEXT NOT NULL DEFAULT '',
  returned_by VARCHAR(50),
  returned_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS kral_request_items (
  request_id INTEGER NOT NULL REFERENCES kral_requests(id),
  material_id INTEGER NOT NULL REFERENCES kral_materials(id),
  quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (request_id, material_id)
);
CREATE INDEX IF NOT EXISTS kral_material_location_idx ON kral_materials(location_id);
CREATE INDEX IF NOT EXISTS kral_request_owner_idx ON kral_requests(requester_ci);
CREATE INDEX IF NOT EXISTS kral_request_status_idx ON kral_requests(status);
COMMIT;
