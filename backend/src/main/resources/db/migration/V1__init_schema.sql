-- Extensions for EXCLUDE overlap (doctor + time range)
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE user_role AS ENUM ('ADMIN', 'MEDECIN', 'PATIENT');

CREATE TYPE rendez_vous_statut AS ENUM (
    'EN_ATTENTE',
    'CONFIRME',
    'ANNULE',
    'TERMINE'
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(80)  NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role    NOT NULL,
    enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE administrateurs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    niveau_acces    VARCHAR(50) NOT NULL
);

CREATE TABLE medecins (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    specialite      VARCHAR(120) NOT NULL,
    numero_ordre    VARCHAR(80)  NOT NULL UNIQUE
);

CREATE TABLE patients (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    date_naissance  DATE         NOT NULL,
    telephone       VARCHAR(40)  NOT NULL
);

CREATE TABLE disponibilites (
    id              BIGSERIAL PRIMARY KEY,
    medecin_id      BIGINT NOT NULL REFERENCES medecins (id) ON DELETE CASCADE,
    jour            SMALLINT NOT NULL CHECK (jour >= 1 AND jour <= 7),
    heure_debut     TIME NOT NULL,
    heure_fin       TIME NOT NULL,
    CONSTRAINT disponibilites_heure_check CHECK (heure_fin > heure_debut)
);

CREATE INDEX idx_disponibilites_medecin_jour ON disponibilites (medecin_id, jour);

CREATE TABLE rendez_vous (
    id              BIGSERIAL PRIMARY KEY,
    medecin_id      BIGINT NOT NULL REFERENCES medecins (id) ON DELETE RESTRICT,
    patient_id      BIGINT NOT NULL REFERENCES patients (id) ON DELETE RESTRICT,
    date            DATE NOT NULL,
    heure_debut     TIME NOT NULL,
    heure_fin       TIME NOT NULL,
    statut          rendez_vous_statut NOT NULL DEFAULT 'EN_ATTENTE',
    CONSTRAINT rendez_vous_heure_check CHECK (heure_fin > heure_debut),
    CONSTRAINT rendez_vous_no_overlap EXCLUDE USING gist (
        medecin_id WITH =,
        tsrange(
            (date + heure_debut)::timestamp,
            (date + heure_fin)::timestamp,
            '[)'
        ) WITH &&
    )
);

CREATE INDEX idx_rendez_vous_medecin_date ON rendez_vous (medecin_id, date);
CREATE INDEX idx_rendez_vous_patient_date ON rendez_vous (patient_id, date);

CREATE TABLE dossier_patient (
    id              BIGSERIAL PRIMARY KEY,
    patient_id    BIGINT NOT NULL UNIQUE REFERENCES patients (id) ON DELETE CASCADE,
    date_creation   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE note_medicale (
    id              BIGSERIAL PRIMARY KEY,
    dossier_id      BIGINT NOT NULL REFERENCES dossier_patient (id) ON DELETE CASCADE,
    contenu         TEXT NOT NULL,
    date_creation   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_note_medicale_dossier ON note_medicale (dossier_id);

CREATE TABLE statistiques (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type            VARCHAR(80) NOT NULL,
    valeur          DOUBLE PRECISION NOT NULL
);

CREATE INDEX idx_statistiques_user ON statistiques (user_id);

CREATE TABLE chatbot_service (
    id              BIGSERIAL PRIMARY KEY,
    nom             VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE chatbot_interaction (
    id                  BIGSERIAL PRIMARY KEY,
    service_id          BIGINT NOT NULL REFERENCES chatbot_service (id) ON DELETE CASCADE,
    user_id             BIGINT REFERENCES users (id) ON DELETE SET NULL,
    question            TEXT NOT NULL,
    reponse             TEXT NOT NULL,
    date_interaction    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chatbot_interaction_service ON chatbot_interaction (service_id);
CREATE INDEX idx_chatbot_interaction_user ON chatbot_interaction (user_id);
