package core

import com.google.inject.Guice
import core.cleanup.CleanUpCoroutine
import core.config.Args
import core.db.CassandraConnector
import core.exception.UserFacingException
import dev.misfitlabs.kotlinguice4.getInstance
import io.javalin.Javalin
import org.cognitor.cassandra.migration.Database
import org.cognitor.cassandra.migration.MigrationConfiguration
import org.cognitor.cassandra.migration.MigrationRepository
import org.cognitor.cassandra.migration.MigrationTask
import org.cognitor.cassandra.migration.keyspace.Keyspace
import org.eclipse.jetty.http.HttpStatus.INTERNAL_SERVER_ERROR_500
import org.slf4j.Logger

/**
 * @author Leon Camus
 * @since 18.09.2019
 */
fun main() {
    val injector = Guice.createInjector(BackendModule())
    val session = CassandraConnector(injector.getInstance()).session
    val args = injector.getInstance<Args>()
    MigrationTask(
        Database(session, MigrationConfiguration().withKeyspace(Keyspace(args.keyspace))),
        MigrationRepository()
    ).migrate()

    val javalin = injector.getInstance<Javalin>()
    val logger = injector.getInstance<Logger>()

    javalin.exception(UserFacingException::class.java) { exception, ctx ->
        if (exception.status >= 500) {
            logger.error("An error occurred during a request", exception)
        }
        ctx.status(exception.status).json(exception.userMessage)
    }
    javalin.exception(Exception::class.java) { exception, ctx ->
        logger.info("An error occurred during a request", exception)
        ctx.status(INTERNAL_SERVER_ERROR_500).result("Internal Server Error")
    }.start(
        injector.getInstance<Args>().port
    )

    CleanUpCoroutine.start(args)
}
