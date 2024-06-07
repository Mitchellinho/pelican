CREATE TABLE applicant
(
    applicant_id         UUID,
    last_name            TEXT,
    first_name           TEXT,
    gender               TEXT,
    salutation           TEXT,
    mail                 TEXT,
    country              TEXT,
    city                 TEXT,
    street               TEXT,
    nationality          TEXT,
    birth_of_date        TEXT,
    applications         list<TEXT>,
    degree               TEXT,
    university           TEXT,

    PRIMARY KEY ((applicant_id))
    );