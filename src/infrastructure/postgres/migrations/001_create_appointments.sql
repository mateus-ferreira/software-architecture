CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    period TSTZRANGE NOT NULL,
    location VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT appointments_doctor_date EXCLUDE USING gist (
        doctor_id WITH =,
        period WITH &&
    ),

    CONSTRAINT appointments_patient_date EXCLUDE USING gist (
        patient_id WITH =,
        period WITH &&
    )
);