CREATE TABLE exam
(
    exam_id     UUID,
    caption     TEXT, -- Empfehlung: letzten 3-4 Ziffern vom moodle exam kurs verwenden
    course_url  TEXT,
    study_regulation_id     UUID,
    study_regulation_name   TEXT,
    exam_location_id   list<UUID>,
    exam_duration    INT,  --Stunden oder in Minuten
    semester    TEXT,
    department  TEXT,
    start_time  list<TIMESTAMP>,
    end_time    list<TIMESTAMP>,
    notes       TEXT,

    PRIMARY KEY ((exam_id))
    );