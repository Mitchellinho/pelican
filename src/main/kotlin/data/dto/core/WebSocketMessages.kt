package data.dto.core

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import java.time.Instant

/**
 * @author Frank Nelles
 * @since 23.11.2020
 */
enum class MessageStatus { HEARTBEAT, SUCCESS, INFO, WARNING, ERROR }

/**
 * @author Frank Nelles
 * @since 04.08.2022
 */
enum class UploadMessageStatus { HEARTBEAT, SUCCESS, INFO, WARNING, ERROR }
const val HEARTBEAT_INTERVAL = 5000L

/**
 * @author Frank Nelles
 * @since 23.11.2020
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "@class")
@JsonSubTypes(
    JsonSubTypes.Type(value = HeartbeatMessage::class, name = "HeartbeatMessage"),
    JsonSubTypes.Type(value = UploadMessage::class, name = "UploadMessage"),
    JsonSubTypes.Type(value = SomeMessageType::class, name = "SomeMessageType")
)
interface WebSocketMessage

/**
 * @author Frank Nelles
 * @since 23.11.2020
 */
@JsonTypeName("HeartbeatMessage")
data class HeartbeatMessage(
    val time: String = Instant.now().toString()
) : WebSocketMessage

/**
 * @author Frank Nelles
 * @since 23.11.2020
 */
@JsonTypeName("UploadMessage")
data class UploadMessage(
    val status: UploadMessageStatus,
    val message: String,
    val time: String = Instant.now().toString()
) : WebSocketMessage

/**
 * @author Frank Nelles
 * @since 09.01.2022
 */
@JsonTypeName("SomeMessageType")
data class SomeMessageType(
    val status: MessageStatus,
    val message: String,
    val time: String = Instant.now().toString()
) : WebSocketMessage
