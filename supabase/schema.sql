-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    email_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    suggested_action TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    requires_human_review BOOLEAN NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sla_deadline TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    corrected_category TEXT,
    corrected_priority TEXT,
    agent_notes TEXT,
    society_name TEXT,
    extracted_location TEXT,
    extracted_asset_id TEXT
);

-- Create telemetry table
CREATE TABLE IF NOT EXISTS telemetry (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create settings table (constrained to single-row)
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1 CONSTRAINT only_one_row CHECK (id = 1),
    confidence_threshold DOUBLE PRECISION NOT NULL DEFAULT 0.70,
    auto_routing_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    keyword_safety_net BOOLEAN NOT NULL DEFAULT TRUE,
    urgent_sla_minutes INT NOT NULL DEFAULT 15,
    high_sla_minutes INT NOT NULL DEFAULT 60,
    medium_sla_minutes INT NOT NULL DEFAULT 240,
    low_sla_minutes INT NOT NULL DEFAULT 1440
);

-- Insert default settings row if not present
INSERT INTO settings (id, confidence_threshold, auto_routing_enabled, keyword_safety_net, urgent_sla_minutes, high_sla_minutes, medium_sla_minutes, low_sla_minutes)
VALUES (1, 0.70, TRUE, TRUE, 15, 60, 240, 1440)
ON CONFLICT (id) DO NOTHING;
