package core.security

import java.security.SecureRandom
import java.security.spec.KeySpec
import java.util.Base64
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

/**
 * @author Michael
 * @since 27.09.2022
 */
class PasswordHasher {
    /**
     * @author Michael
     * @since 27.09.2022
     */
    private fun salt(): ByteArray {
        val random = SecureRandom()
        val salt = ByteArray(128)
        random.nextBytes(salt)
        return salt
    }

    /**
     * @author Michael
     * @since 27.09.2022
     */
    fun hash(password: String): String {
        return this.hash(password, this.salt())
    }

    /**
     * @author Michael
     * @since 27.09.2022
     */
    private fun hash(password: String, salt: ByteArray): String {
        val spec: KeySpec = PBEKeySpec(password.toCharArray(), salt, 65536, 256)
        val factory: SecretKeyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512")
        val hash: ByteArray = factory.generateSecret(spec).encoded
        return String.format(
            "%s:%s",
            this.encode(salt),
            this.encode(hash)
        )
    }

    /**
     * @author Michael
     * @since 27.09.2022
     */
    fun verify(password: String, storedPassword: String): Boolean {
        val salt = storedPassword.split(":")[0].toByteArray()
        return this.hash(password, decode(salt)) == storedPassword
    }

    /**
     * @author Michael
     * @since 27.09.2022
     */
    private fun encode(input: ByteArray): String {
        return Base64.getEncoder().encodeToString(input)
    }

    /**
     * @author Michael
     * @since 27.09.2022
     */
    private fun decode(input: ByteArray): ByteArray {
        return Base64.getDecoder().decode(input)
    }

    /**
     * @author Michael
     * @since 27.09.2022
     */
    fun createRandomPassword(): String {
        val allowedChars = ('A'..'Z') + ('a'..'z') + ('0'..'9')
        return (1..15)
            .map { allowedChars.random() }
            .joinToString("")
    }
}
