package backend.classifier

import ClassifierController
import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post

object ClassifierModule : ControllerModule() {
    override fun configure() {
        route<ClassifierController> { controller ->
            path("classifier") {
                get("", controller::get, Roles.AUTH)
                get("as/array", controller::getAllclassifiers, Roles.AUTH)
                post("insert", controller::insertClassifier, Roles.AUTH)
                post("delete", controller::deleteClassifier, Roles.AUTH)
            }
        }
    }
}
