package core.security

import io.javalin.security.RouteRole

/**
 * @author Frank Nelles
 * @since 13.06.2020
 */
enum class Roles : RouteRole {
    AUTH,
    PUBLIC
}
