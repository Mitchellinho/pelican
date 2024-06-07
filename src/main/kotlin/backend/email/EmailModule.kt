package backend.email

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post

/**
 * @author Leon Camus
 * @since 07.04.2020
 */
object EmailModule : ControllerModule() {
    override fun configure() {
        route<EmailController> { controller ->
            path("email") {
                post("", controller::sendEmail, Roles.AUTH)
            }
        }
    }
}
