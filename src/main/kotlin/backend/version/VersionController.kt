package backend.version

import io.javalin.http.Context
import io.javalin.openapi.ContentType

/**
 * @author Leon Camus
 * @since 05.02.2020
 */
class VersionController {
    /**
     * The current backend version.
     */
    fun getVersion(ctx: Context) {
        ctx.contentType(ContentType.JSON)
        ctx.result({}.javaClass.getResource("/version.json").readText())
    }
}
