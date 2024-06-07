package core.exception

import data.dto.core.Lang

/**
 * @author Leon Camus
 * @since 04.04.2020
 */
class UserFacingException(
    val userMessage: Lang,
    val status: Int,
    message: String? = null,
    cause: Throwable? = null
) : Exception(message, cause)
