package core.security

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.TokenExpiredException
import com.auth0.jwt.interfaces.DecodedJWT
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.google.common.cache.CacheBuilder
import com.google.common.cache.CacheLoader
import com.google.common.cache.LoadingCache
import io.javalin.http.ForbiddenResponse
import java.nio.charset.StandardCharsets
import java.time.Instant
import org.apache.commons.codec.binary.Base64

/**
 * @author Leon Camus
 * @since 17.03.2020
 */
data class Token<T : Payload>(
    val algorithm: Algorithm,
    val objectMapper: ObjectMapper,
    val header: Map<String, Any> = mapOf("typ" to "JWT", "alg" to algorithm.name),
    val payload: T
) {
    companion object {
        val verifierCache: LoadingCache<Algorithm, JWTVerifier> = CacheBuilder.newBuilder()
            .build(object : CacheLoader<Algorithm, JWTVerifier>() {
                override fun load(algorithm: Algorithm): JWTVerifier = JWT.require(algorithm).build()!!
            })

        /**
         * Create a new token.
         */
        inline operator fun <reified T : Payload> invoke(
            token: String,
            algorithm: Algorithm,
            objectMapper: ObjectMapper
        ): Token<T> {
            val decodedJWT: DecodedJWT
            try {
                decodedJWT = verifierCache[algorithm].verify(token)
            } catch (_: TokenExpiredException) {
                throw ForbiddenResponse()
            }

            val header = objectMapper.readValue<Map<String, Any>>(
                Base64.decodeBase64(decodedJWT.header).toString(StandardCharsets.UTF_8)
            )
            val payload = objectMapper.readValue<T>(
                Base64.decodeBase64(decodedJWT.payload).toString(StandardCharsets.UTF_8)
            )

            return Token(algorithm, objectMapper, header, payload)
        }
    }

    private val headerJson: String get() = objectMapper.writeValueAsString(header)
    private val payloadJson: String get() = objectMapper.writeValueAsString(payload)

    /**
     * Add a claim to the header.
     */
    fun headerClaim(name: String, claim: Any): Token<T> = copy(header = header + (name to claim))

    /**
     * Emit the signed token as a base64 encoded string representation.
     */
    fun sign(): String {
        val header = Base64.encodeBase64URLSafeString(headerJson.toByteArray(StandardCharsets.UTF_8))
        val payload = Base64.encodeBase64URLSafeString(payloadJson.toByteArray(StandardCharsets.UTF_8))
        val signatureBytes = algorithm.sign(
            header.toByteArray(StandardCharsets.UTF_8),
            payload.toByteArray(StandardCharsets.UTF_8)
        )
        val signature = Base64.encodeBase64URLSafeString(signatureBytes)

        return String.format("%s.%s.%s", header, payload, signature)
    }
}

/**
 * @author Leon
 * @since 16.4.2020
 */
@Suppress("UnnecessaryAbstractClass")
abstract class Payload(
    @JsonProperty("exp") private val expiresAt: Instant,
    @JsonProperty("iat") private val issuedAt: Instant,
    @JsonProperty("nbf") private val notBefore: Instant
) {
    var exp: Instant = expiresAt
    val iat: Instant get() = issuedAt
    val nbf: Instant get() = notBefore
}
