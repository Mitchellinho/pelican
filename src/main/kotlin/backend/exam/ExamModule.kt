package backend.exam

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post

object ExamModule : ControllerModule() {
    override fun configure() {
        route<ExamController> { controller ->
            path("exam") {
                get("", controller::getExam, Roles.AUTH)
                get("as/array", controller::getAllExams, Roles.AUTH)
                get("as/array/with/department", controller::getAllExamsWithDepartment, Roles.AUTH)
                post("insert", controller::insertExam, Roles.AUTH)
                post("update", controller::updateExam, Roles.AUTH)
                post("delete", controller::deleteExam, Roles.AUTH)
            }
        }
    }
}
