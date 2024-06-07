package backend.version

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get

/**
 * @author Leon Camus
 * @since 05.02.2020
 */
object VersionModule : ControllerModule() {
    override fun configure() {
        route<VersionController> { controller ->
            get("version", controller::getVersion, Roles.PUBLIC)
        }
    }
}
