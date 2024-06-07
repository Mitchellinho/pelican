package backend.exchange

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post
import io.javalin.apibuilder.ApiBuilder.ws

object ExchangeModule : ControllerModule() {
    override fun configure() {
        route<ExchangeController> { controller ->
            path("exchange/{webSocketId}") {
                post("upload", controller::uploadWithWebSocketId, Roles.AUTH)
                post("single-file-upload/{filename}", controller::uploadSingleFile, Roles.AUTH)
                ws("upload/ws", controller::uploadMessagesWebSocket, Roles.AUTH)
            }
        }
    }
}
