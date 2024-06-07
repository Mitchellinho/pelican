package core.security

import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTDecodeException
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.google.inject.Inject
import core.config.Args
import core.json.JacksonModule.JacksonKotlinModule
import data.bean.User
import io.javalin.http.BadRequestResponse
import java.math.BigInteger
import java.security.SecureRandom
// import kotlin.math.exp
import java.time.Instant

/**
 * @author Frank Nelles
 * @since 25.06.2020
 */
class TokenManager @Inject constructor(
    private val args: Args
    // private val userDao: UserDao
) {
    private val objectMapper: ObjectMapper = ObjectMapper()
        .configure(SerializationFeature.FAIL_ON_UNWRAPPED_TYPE_IDENTIFIERS, false)
        .registerModules(JacksonKotlinModule, JavaTimeModule())

    private val secret: String = args.tokenSecret ?: BigInteger(130, SecureRandom()).toString(32)
    private val algorithm = Algorithm.HMAC512(secret)!!

    /**
     * Decodes an auth token.
     */
    fun decodeToken(token: String): PayloadPelicanToken {
        try {
            return Token<PayloadPelicanToken>(token, algorithm, objectMapper).payload
        } catch (e: JWTDecodeException) {
            throw BadRequestResponse()
        }
    }

    companion object {
        const val TOKEN_HEADER_FIELD_NAME = "AUTH"
        const val TOKEN_EXPIRATION: Long = 6L * 60 * 60 // sec = hr * min * sec
        const val TOKEN_DROP_CHARS: Int = 7
    }

    /**
     * Generate user token from alpha token and course information
     */
    fun createPelicanUserToken(user: User): String {
        val issued = Instant.now()
        val pelicanToken = PayloadPelicanToken(
            expiresAt = issued.plusSeconds(TOKEN_EXPIRATION),
            issuedAt = issued,
            notBefore = issued,
            type = user.userType,
            id = user.userId,
            displayName = user.firstName + " " + user.lastName,
            isAdmin = user.userType != "Applicant",
            department = user.department
        )

        return Token(algorithm = algorithm, objectMapper = objectMapper, payload = pelicanToken).sign()
    }

    /**
     * Request the course token from alpha and resign it with own secret
     */
    fun handleToken(token: String): String {
        val pelicanToken = decodeToken(token)
        /*
            TODO: This code is based on a service for all courses, please adapt if your Pelican does it any
             other way.
            TODO: See other services.
         */
        // Return course token only if the user has a course id and is not admin
        return Token(algorithm = algorithm, objectMapper = objectMapper, payload = pelicanToken).sign()
    }

    /**
     * Refresh Pelican token
     */
    fun refreshToken(token: String): String {
        val pelicanToken = Token<PayloadPelicanToken>(token, algorithm, objectMapper)
        pelicanToken.payload.exp = Instant.now().plusSeconds(TOKEN_EXPIRATION)
        return pelicanToken.sign()
    }
}
