package core

import com.datastax.oss.driver.api.core.CqlSession
import com.fasterxml.jackson.databind.ObjectMapper
import com.google.inject.Guice
import com.google.inject.Inject
import com.google.inject.Singleton
import com.google.inject.util.Modules
import core.config.Args
import core.db.CassandraConnector
import core.routing.Routing
import dev.misfitlabs.kotlinguice4.KotlinModule
import dev.misfitlabs.kotlinguice4.getInstance
import io.github.cdimascio.dotenv.Dotenv
import io.javalin.Javalin
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.json.JavalinJackson
import io.javalin.openapi.OpenApiInfo
import io.javalin.openapi.plugin.OpenApiConfiguration
import io.javalin.openapi.plugin.OpenApiPlugin
import io.swagger.v3.core.util.Yaml
import java.io.File
import kotlin.system.exitProcess
import org.cognitor.cassandra.migration.Database
import org.cognitor.cassandra.migration.MigrationConfiguration
import org.cognitor.cassandra.migration.MigrationRepository
import org.cognitor.cassandra.migration.MigrationTask
import org.cognitor.cassandra.migration.keyspace.Keyspace
import org.slf4j.Logger

/**
 * @author Joshua Storch
 * @since 20.02.2020
 */
fun main(args: Array<String>) {
    val injector = Guice.createInjector(
        Modules.override(
            BackendModule()
        ).with(
            OpenApiCreateOverrideModule()
        )
    )
    val objectMapper = injector.getInstance<ObjectMapper>()
    val routes = injector.getInstance<Set<Routing<*>>>()
    val session = injector.getInstance<CqlSession>()
    val logger = injector.getInstance<Logger>()
    val arguments = injector.getInstance<Args>()

    logger.info("Dropping keyspace ${arguments.keyspace}")
    session.execute("DROP KEYSPACE IF EXISTS ${arguments.keyspace}")
    logger.info("Creating keyspace ${arguments.keyspace}")
    session.execute(
        """
            CREATE KEYSPACE ${arguments.keyspace}
            WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };
        """
    )

    MigrationTask(
        Database(
            CassandraConnector(injector.getInstance()).session,
            MigrationConfiguration().withKeyspace(Keyspace(injector.getInstance<Args>().keyspace))
        ),
        MigrationRepository()
    ).migrate()

    val openApiConfig = OpenApiConfiguration()

    openApiConfig.info = OpenApiInfo().apply {
        this.title = "Pelican Api"
        this.version = "1.0"
        this.description = "Pelican Api"
    }

    openApiConfig.documentProcessor = {
        val jsonFile = File(args[0])
        File(jsonFile.parent).mkdirs()
        jsonFile.createNewFile()
        jsonFile.writeText(objectMapper.writeValueAsString(it))

        val ymlFile = File(args[1])
        ymlFile.createNewFile()
        ymlFile.writeText(Yaml.pretty(it))

        objectMapper.writeValueAsString(it)
    }

    val javalin = Javalin.create {
        JavalinJackson(objectMapper)
        it.plugins.register(OpenApiPlugin(openApiConfig))
    }.routes {
        path("backend") {
            routes.forEach(Routing<*>::call)
        }
    }

    javalin.stop()
    logger.info("Dropping keyspace ${arguments.keyspace}")
    session.execute("DROP KEYSPACE IF EXISTS ${arguments.keyspace}")
    session.close()
    exitProcess(0)
}

/**
 * @author Joshua Storch
 * @since 24.03.2021
 */
class OpenApiCreateOverrideModule : KotlinModule() {
    override fun configure() {
        bind<Args>().to<ApiCreateArgs>().`in`<Singleton>()
    }
}

/**
 * @author Joshua Storch
 * @since 24.03.2021
 */
class ApiCreateArgs @Inject constructor(
    dotenv: Dotenv,
    logger: Logger
) : Args(dotenv, logger) {
    override val increaseCassandraTimeout = true
    override val keyspace = dotenv["PELICAN_API_CREATE_CASSANDRA_KEYSPACE"]
        ?: dotenv["CI_JOB_ID"]?.let { ciId ->
            logger.info(
                "PELICAN_API_CREATE_CASSANDRA_KEYSPACE not found, " +
                    "falling back to ci default value pelican_api_create_ci_$ciId"
            )
            "pelican_api_create_ci$ciId"
        }
        ?: run {
            logger.info(
                "PELICAN_API_CREATE_CASSANDRA_KEYSPACE not found, " +
                    "falling back to default value pelican_api_create"
            )
            "pelican_api_create"
        }
}
