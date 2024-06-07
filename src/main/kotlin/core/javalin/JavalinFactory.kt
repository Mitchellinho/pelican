package core.javalin

import com.fasterxml.jackson.databind.ObjectMapper
import com.google.inject.Inject
import com.google.inject.Provider
import core.routing.Routing
import io.javalin.Javalin
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.json.JavalinJackson
import io.javalin.security.AccessManager
import org.eclipse.jetty.http.HttpStatus
import org.slf4j.Logger

/**
 * @author Leon Camus
 * @since 05.02.2020
 */
class JavalinFactory @Inject constructor(
    private val objectMapper: ObjectMapper,
    private val routes: Set<Routing<*>>,
    private val LOG: Logger
) : Provider<Javalin> {
    @Inject(optional = true)
    private val accessManager: AccessManager? = null

    override fun get(): Javalin = Javalin.create {
        it.jsonMapper(JavalinJackson(objectMapper))
        it.compression.brotliAndGzip()

        if (accessManager != null) {
            it.accessManager(accessManager)
        } else {
            it.accessManager { handler, ctx, _ ->
                handler.handle(ctx)
            }
        }
    }.routes {
        path("backend") {
            routes.forEach(Routing<*>::call)
        }
    }.exception(Exception::class.java) { exception, ctx ->
        LOG.debug("An error occurred during a request", exception)
        ctx.status(HttpStatus.INTERNAL_SERVER_ERROR_500).result("Internal Server Error")
    }
}
