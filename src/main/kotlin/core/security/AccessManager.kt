package core.security

import com.google.inject.Inject
import io.javalin.http.Context
import io.javalin.http.Handler
import io.javalin.http.NotFoundResponse
import io.javalin.http.headerAsClass
import io.javalin.http.queryParamAsClass
import io.javalin.security.AccessManager
import io.javalin.security.RouteRole

/**
 * @author Frank Nelles
 * @since 25.06.2020
 */
class AccessManager @Inject constructor(
    private val tokenManager: TokenManager
) : AccessManager {
    override fun manage(handler: Handler, ctx: Context, routeRoles: Set<RouteRole>) {
        when {
            routeRoles.isEmpty() -> {
                handler.handle(ctx)
            }
            else -> {
                val auth = routeRoles.contains(Roles.AUTH)
                val public = routeRoles.contains(Roles.PUBLIC)

                if (auth) {
                    val tokenPayload = if (websocket(ctx)) { // Connection is websocket
                        val token = ctx.queryParamAsClass<String>("token").get()
                        tokenManager.decodeToken(token)
                    } else { // Connection is not websocket
                        val token = ctx.headerAsClass<String>(TokenManager.TOKEN_HEADER_FIELD_NAME).get()
                            .drop(TokenManager.TOKEN_DROP_CHARS)
                        tokenManager.decodeToken(token)
                    }

                    ctx.attribute("token", tokenPayload)
                    handler.handle(ctx)

                    return
                }

                if (public) {
                    handler.handle(ctx)
                    return
                }

                throw NotFoundResponse()
            }
        }
    }

    /**
     * Check whether the connection is a websocket.
     * Websockets need to contain "/ws" in the URL and have a query param "token" with the token
     */
    private fun websocket(ctx: Context): Boolean {
        return ctx.path().contains("/ws") && ctx.queryParam("token") != null
    }
}
