package core.config

import com.google.inject.Inject
import io.github.cdimascio.dotenv.Dotenv
import java.net.InetSocketAddress
import org.slf4j.Logger

/* ktlint-disable custom:class-without-function-data-class */
/**
 * @author Frank Nelles
 * @since 11.06.2020
 */
@Suppress("UnusedPrivateMember")
open class Args @Inject constructor(dotenv: Dotenv, logger: Logger) {
    /** Service **/
    val port = dotenv["PELICAN_SERVER_PORT"]?.toInt() ?: 12345
    val storageDir = dotenv["PELICAN_STORAGE_DIR"] ?: "data"
    val alphaUrl = dotenv["ALPHA_URL"]?.removeSuffix("/") ?: "https://alpha.e-learning.tu-darmstadt.de"
    val tokenSecret: String? = dotenv["TOKEN_SECRET"]

    /** Cassandra **/
    open val keyspace = dotenv["PELICAN_CASSANDRA_KEYSPACE"] ?: "pelican"
    val databaseNodeAddresses = dotenv["CASSANDRA_NODE"]?.split(",")?.map { addressString ->
        val addressParts = addressString.split(":")
        InetSocketAddress(
            addressParts[0],
            addressParts.getOrNull(1)?.toInt() ?: 9042
        )
    } ?: error("Environment variable CASSANDRA_NODE not found!")
    val datacenter = dotenv["CASSANDRA_DATACENTER"]
        ?: error("Environment variable CASSANDRA_DATACENTER not found!")

    open val increaseCassandraTimeout = false

    /** Mail **/
    val mailSmtpHost = dotenv["MAIL_SMTP_HOST"] ?: run {
        logger.warn("Environment Variable MAIL_SMTP_HOST not found, thus email sending is disabled.")
        null
    }
    val mailSmtpPort = dotenv["MAIL_SMTP_PORT"]?.toInt() ?: run {
        logger.warn("Environment Variable MAIL_SMTP_PORT not found, thus email sending is disabled.")
        null
    }
    val mailSmtpUsername = dotenv["MAIL_SMTP_USERNAME"] ?: run {
        logger.warn("Environment Variable MAIL_SMTP_USERNAME not found, only SMTP without Auth available.")
        null
    }
    val mailSmtpTls = dotenv["MAIL_SMTP_TLS"].toBoolean()
    val mailSmtpStartTls = dotenv["MAIL_SMTP_STARTTLS"].toBoolean().also {
        if (it && mailSmtpTls) {
            logger.warn("SMTP TLS and STARTTLS are both enabled. This may lead to unexpected behavior!")
        }
    }
    val mailSmtpPassword = dotenv["MAIL_SMTP_PASSWORD"] ?: run {
        logger.warn("Environment Variable MAIL_SMTP_PASSWORD not found, only SMTP without Auth available.")
        null
    }
    val mailSmtpSender = dotenv["MAIL_SMTP_SENDER"] ?: run {
        logger.warn("Environment Variable MAIL_SMTP_SENDER not found, thus email sending is disabled.")
        null
    }

    val mailEnabled = mailSmtpHost != null && mailSmtpPort != null && mailSmtpSender != null
}
