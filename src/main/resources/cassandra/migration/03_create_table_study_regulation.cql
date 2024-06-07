CREATE TABLE study_regulation
(
    study_regulation_id  UUID,
    name                 TEXT,
    department           TEXT,
    conditions           list<TEXT>,
    credit_points        list<TEXT>,
    max_cp               TEXT,
    university           list<TEXT>,
    exam_amount          list<INT>,
    exam_passed          list<INT>,
    exam_conditions      list<frozen<list<TEXT>>>,
    classifier           UUID,
    PRIMARY KEY ((study_regulation_id))
    );