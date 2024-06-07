package backend.auth

import core.routing.ControllerModule
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path

object AuthModule : ControllerModule() {
    override fun configure() {
        route<AuthController> { controller ->
            path("auth") {
                get("", controller::getToken)
                get("refresh", controller::refreshAuthentication)
                get("login", controller::normalLogin)
            }
        }
    }
}
