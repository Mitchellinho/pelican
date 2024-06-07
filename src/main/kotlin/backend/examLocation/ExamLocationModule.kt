package backend.examLocation

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post

object ExamLocationModule : ControllerModule() {
    override fun configure() {
        route<ExamLocationController> { controller ->
            path("examlocation") {
                get("", controller::getExamLocation, Roles.AUTH)
                get("as/array", controller::getAllExamLocations, Roles.AUTH)
                get("as/array/with/department", controller::getAllExamLocationsWithDepartment, Roles.AUTH)
                post("insert", controller::insertExamLocation, Roles.AUTH)
                post("update", controller::updateExamLocation, Roles.AUTH)
                post("delete", controller::deleteExamLocation, Roles.AUTH)
            }
        }
    }
}
