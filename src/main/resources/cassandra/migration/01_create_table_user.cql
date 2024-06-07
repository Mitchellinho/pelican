CREATE TABLE user
(
    user_id              UUID,
    username             TEXT,
    mail                 TEXT,
    password             TEXT,
    department           TEXT,
    user_type            TEXT,
    first_name           TEXT,
    last_name            TEXT,
    last_login           TIMESTAMP,

    PRIMARY KEY ((user_id))
    );

INSERT INTO user (user_id, username, mail, password, department, user_type, first_name, last_name, last_login) VALUES (uuid(), 'mi.gense@gmx.de', 'mi.gense@gmx.de', '1234', '20', 'Admin', 'Michael', 'Gense', dateof(now()));
INSERT INTO user (user_id, username, mail, password, department, user_type, first_name, last_name, last_login) VALUES (uuid(), 'atlas', 'pelican@lu-e.de', 'atlas', '20', 'Admin', 'Atlas', 'Englisch', dateof(now()));

CREATE TABLE user_configuration
(
    user_id            UUID,
    user_configuration TEXT,

    PRIMARY KEY ((user_id))
);
