package core

import backend.EntryModule
import com.datastax.oss.driver.api.core.CqlSession
import core.config.Args
import core.db.CassandraConnector
import core.javalin.JavalinFactory
import core.json.JacksonModule
import core.security.TokenManager
import data.dao.DataModule
import dev.misfitlabs.kotlinguice4.KotlinModule
import io.github.cdimascio.dotenv.Dotenv
import io.javalin.Javalin
import io.javalin.validation.JavalinValidation
import java.time.Instant
import java.util.UUID
import javax.inject.Singleton
import org.slf4j.Logger
import org.slf4j.LoggerFactory

/**
 * @author Leon Camus
 * @since 05.02.2020
 */
class BackendModule : KotlinModule() {
    val logger = LoggerFactory.getLogger("Pelican") ?: error("Could not create Logger")

    override fun configure() {
        bind<Dotenv>().toInstance(Dotenv.configure().ignoreIfMissing().load())
        bind<Args>().`in`<Singleton>()
        bind<Logger>().toInstance(logger)
        bind<CqlSession>().toProvider<CassandraConnector>().`in`<Singleton>()

        JavalinValidation.register(List::class.java) { param -> param.split(",") }
        JavalinValidation.register(UUID::class.java) { param -> UUID.fromString(param) }
        JavalinValidation.register(Instant::class.java) { param -> Instant.ofEpochMilli(param.toLong()) }

        install(JacksonModule)
        bind<TokenManager>().`in`<Singleton>()
        install(DataModule)

        install(EntryModule)

        // bind<*SecurityHelper>().`in`<Singleton>()

        bind<io.javalin.security.AccessManager>().to<core.security.AccessManager>().`in`<Singleton>()

        bind<Javalin>().toProvider<JavalinFactory>().`in`<Singleton>()
    }
}
