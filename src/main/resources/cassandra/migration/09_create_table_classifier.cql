CREATE TABLE classifier
(
    id                    UUID,
    created               TIMESTAMP,
    single_label_score    FLOAT,
    single_label_score_balanced    FLOAT,
    true_positives INT,
    true_negatives INT,
    false_positives INT,
    false_negatives INT,
    multi_label_score     FLOAT,
    semester_trained_on   list<TEXT>,
    balanced_training BOOLEAN,
    max_depth INT,
    min_samples_leaf INT,
    study_regulation TEXT,

    PRIMARY KEY ((id))
);