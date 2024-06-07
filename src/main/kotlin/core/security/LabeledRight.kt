package core.security

/**
 * @author Frank Nelles
 * @since 14.07.2020
 */
enum class LabeledRight(val id: Int) {
    /** LabeledRights by other services **/
    ALPHA_DISPLAY_USER_BY_RIGHT(0),
    ALPHA_DISPLAY_USER_BY_COURSE(1),
    ALPHA_RIGHT_EDIT(2),
    ALPHA_RIGHT_ASSIGNMENT(22),
    ALPHA_RIGHT_VISIBILITY(3),
    ALPHA_COURSE_DETAIL_EDIT(4),

    LAMBDA_CORRECT(5),
    LAMBDA_CORRECT_ALL(6),
    LAMBDA_CORRECTION_VISIBILITY(7),
    LAMBDA_EXPORT(8),
    LAMBDA_UPLOAD(9),
    LAMBDA_ASSIGN(10),
    LAMBDA_EDIT_GUIDELINES(11),
    LAMBDA_EXAM_VISIBILITY(12),
    LAMBDA_VIDEO_VISIBILITY(13),
    LAMBDA_OPEN_LIST(14),
    LAMBDA_ACCEPT(15),
    LAMBDA_STATUS_VISIBILITY(16),
    LAMBDA_COMMENT(17),
    LAMBDA_SET_PASSING_BOUNDS(18),
    LAMBDA_EDIT_EXAM_FLAGS(19),
    LAMBDA_MANAGE_ISSUE(20),
    LAMBDA_EDIT_NAME(21),
    LAMBDA_EDIT_SUBMISSION(22),
    LAMBDA_MANAGE_DEFAULT_USER_TYPE(23),

    TAU_CREATE_EXAM(30),
    TAU_REVIEW_EXAM(31),

    OMEGA_ARCHIVE_EXAM(999),
    OMEGA_EXPORT_EXAM(998),
    OMEGA_IMPORT_EXAM(997),
    OMEGA_MANAGE_EXAM(996),
    OMEGA_MANAGE_REVIEW(995),
    OMEGA_VIEW_PROTOCOLS(994),
    OMEGA_VIEW_STATISTICS(993),
    OMEGA_VIEW_SUBMISSIONS(992),

    /** You may touch the code below **/
    PELICAN_RIGHTNAME(12345),
    PELICAN_RIGHTNAME2(12346);

    companion object {
        private val map = values().associateBy(LabeledRight::id)

        /**
         * Get LabeledRights from id list
         */
        fun fromIdList(ids: List<Int>): List<LabeledRight> = ids.mapNotNull { map[it] }
    }
}
