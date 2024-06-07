CREATE TABLE rule
(
    rule_id              UUID,
    university           TEXT,
    applied_for          UUID,
    applied_for_name     TEXT,
    active               BOOLEAN,
    system_generated     BOOLEAN,
    condition            list<TEXT>,
    serial_letter        TEXT,
    new_status           TEXT,
    log                  TEXT,
    comment              TEXT,
    department           TEXT,

    PRIMARY KEY ((rule_id))
    );
