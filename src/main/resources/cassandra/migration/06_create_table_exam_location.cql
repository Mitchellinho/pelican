CREATE TABLE exam_location
(

    exam_location_id   UUID,
    read_only   BOOLEAN,
    zip_code    TEXT,
    city        TEXT,
    street      TEXT,
    house_number TEXT,
    designation  TEXT, -- name of room
    description  TEXT,
    department   TEXT,
    in_use       BOOLEAN,

    PRIMARY KEY ((exam_location_id))
    );