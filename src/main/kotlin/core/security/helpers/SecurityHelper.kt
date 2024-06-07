package core.security.helpers

import core.security.PayloadPelicanToken
import io.javalin.http.Context
import io.javalin.websocket.WsContext
import java.util.UUID

/**
 * Get payload
 */
fun Context.payload(): PayloadPelicanToken {
    return this.attribute<PayloadPelicanToken>("token")
        ?: throw java.lang.IllegalStateException("Token has to be present.")
}

/**
 * Get payload
 */
fun WsContext.payload(): PayloadPelicanToken {
    return this.attribute<PayloadPelicanToken>("token")
        ?: throw java.lang.IllegalStateException("Token has to be present.")
}

/**
 * Get the user type from the token payload
 */
fun Context.getUserType(): String {
    return this.payload().type
}

/**
 * Get the user id from the token payload
 */
fun Context.getUserId(): UUID {
    return this.payload().id
}

/**
 * Check if User is Admin
 */
fun Context.isAdmin(): Boolean {
    return this.payload().isAdmin
}

/**
 * Get Current Users department
 */
fun Context.getDepartment(): String {
    return this.payload().department
}
