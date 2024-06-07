CREATE TABLE application
(
    applicant_id         UUID,
    admissions_office    TEXT,
    method               TEXT,
    application_number   TEXT,
    last_name            TEXT,
    first_name           TEXT,
    mail                 TEXT,
    country              TEXT,
    city                 TEXT,
    street               TEXT,
    applied_for          UUID,
    applied_for_name     TEXT,
    university           TEXT,
    semester             TEXT,
    already_applied      BOOLEAN,
    department           TEXT,
    status               TEXT,
    conditions           list<TEXT>,
    cp                   list<TEXT>,
    in_use               BOOLEAN,
    exam                 UUID,
    exam_index           INT,

    PRIMARY KEY ((application_number))
    );