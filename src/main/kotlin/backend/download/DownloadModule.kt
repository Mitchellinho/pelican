package backend.download

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path

object DownloadModule : ControllerModule() {
    override fun configure() {
        route<DownloadController> { controller ->
            path("download") {
                get("table", controller::downloadTable, Roles.AUTH)
            }
        }
    }
}
