package backend.examples

import com.google.inject.Inject
import data.dto.core.HEARTBEAT_INTERVAL
import data.dto.core.MessageStatus
import data.dto.core.SomeMessageType
import data.dto.core.WebSocketMessage
import data.dto.core.timed
import io.javalin.websocket.WsConfig
import io.javalin.websocket.WsContext
import java.util.UUID

/**
 * @author Frank Nelles
 * @since 09.01.2022
 */
class ExampleController @Inject constructor() {
    // Maps some key to a list of connected websocket users
    private val clients = mutableMapOf<UUID, MutableList<WsContext>>()

    /**
     * Create and handle websocket connection for upload messages
     */
    fun uploadMessagesWebSocket(ws: WsConfig) {
        timed(HEARTBEAT_INTERVAL) {
            sendHeartbeat()
        }

        ws.onConnect { ctx ->
            val uuid = ctx.pathParamAsClass<UUID>("uuid").get()
            clients.putIfAbsent(uuid, mutableListOf())
            clients[uuid]?.add(ctx)
        }
        ws.onMessage {
            // This example does not expect any messages
        }
        ws.onClose { ctx ->
            clients[ctx.pathParamAsClass<UUID>("uuid").get()]?.remove(ctx)
        }
    }

    // Send message to all clients
    @Suppress("UnusedPrivateMember")
    private val sendMessage: (examId: UUID, wsMsg: WebSocketMessage) -> Unit = { examId, wsMsg ->
        clients[examId]?.forEach { ctx ->
            ctx.send(wsMsg)
        }
    }

    /**
     * Send heartbeat message to all clients
     */
    private fun sendHeartbeat() {
        clients.forEach { (_, connectionList) ->
            connectionList.forEach { connection ->
                connection.send(SomeMessageType(MessageStatus.HEARTBEAT, ""))
            }
        }
    }
}
