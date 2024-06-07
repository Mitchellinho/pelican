package util

import java.security.MessageDigest

/**
 * @author Frank Nelles
 * @since 22.08.2020
 */

/**
 * Generate sha256 hash encoding from string
 */
fun String.sha256(): String {
    return hashString(this, "SHA-256")
}

/**
 * Hash string
 */
private fun hashString(input: String, algorithm: String): String {
    return MessageDigest
        .getInstance(algorithm)
        .digest(input.toByteArray())
        .fold("", { str, it -> str + "%02x".format(it) })
}
