CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_type VARCHAR(20) NOT NULL DEFAULT '',
  device_name VARCHAR(100) UNIQUE NOT NULL DEFAULT '',
  max_power INTEGER NOT NULL DEFAULT 0,
  active_status BOOLEAN NOT NULL DEFAULT 'f',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_modified_time BEFORE UPDATE ON devices FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
