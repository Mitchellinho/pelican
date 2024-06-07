package backend.studyRegulation

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post

object StudyRegulationModule : ControllerModule() {
    override fun configure() {
        route<StudyRegulationController> { controller ->
            path("studyregulation") {
                get("", controller::get, Roles.AUTH)
                get("as/array", controller::getAll, Roles.AUTH)
                get("as/array/with/department", controller::getAllWithDepartment, Roles.AUTH)
                get("with/degree/and/department", controller::getWithDegreeAndDepartment, Roles.AUTH)
                post("insert", controller::insertStudyRegulation, Roles.AUTH)
                post("update", controller::updateStudyRegulation, Roles.AUTH)
                post("delete", controller::deleteStudyRegulation, Roles.AUTH)
            }
        }
    }
}
