package backend.qsScore

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path

object QSScoreModule : ControllerModule() {
    override fun configure() {
        route<QSScoreController> { controller ->
            path("qsscore") {
                get("", controller::get, Roles.AUTH)
                get("as/array", controller::getAllQSScores, Roles.AUTH)
            }
        }
    }
}
