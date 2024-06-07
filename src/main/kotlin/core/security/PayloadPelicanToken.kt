package core.security

import com.fasterxml.jackson.annotation.JsonAlias
import java.time.Instant
import java.util.UUID

/**
 * @author Frank Nelles
 * @since 25.06.2020
 */

// TODO: Add new parameters

data class PayloadPelicanToken(
    @JsonAlias("exp") private val expiresAt: Instant,
    @JsonAlias("iat") private val issuedAt: Instant,
    @JsonAlias("nbf") private val notBefore: Instant,
    val type: String,
    val id: UUID,
    val displayName: String,
    val isAdmin: Boolean,
    val department: String
) : Payload(expiresAt, issuedAt, notBefore)
