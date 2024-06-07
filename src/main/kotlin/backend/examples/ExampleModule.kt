package backend.examples

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.ws

/**
 * @author Frank Nelles
 * @since 09.01.2022
 */
object ExampleModule : ControllerModule() {
    override fun configure() {
        route<ExampleController> { controller ->
            path("examples") {
                ws("ws/{uuid}", controller::uploadMessagesWebSocket, Roles.AUTH)
            }
        }
    }
}
