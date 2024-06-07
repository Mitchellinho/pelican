package backend.application

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post

object ApplicationModule : ControllerModule() {
    override fun configure() {
        route<ApplicationController> { controller ->
            path("application") {
                get("as/array", controller::getAllApplications, Roles.AUTH)
                get("as/array/with/applicationId", controller::getApplicationsWithApplicantId, Roles.AUTH)
                get("with/application/number", controller::getApplication, Roles.AUTH)
                get("as/array/with/department", controller::getApplicationsWithDepartment, Roles.AUTH)
                get("as/array/with/semester", controller::getApplicationsWithSemester, Roles.AUTH)
                get("as/array/with/semester/and/department", controller::getApplicationWithSemAndDep, Roles.AUTH)
                post("insert", controller::insertApplication, Roles.AUTH)
                post("update", controller::updateApplication, Roles.AUTH)
                post("delete", controller::deleteApplication, Roles.AUTH)
            }
        }
    }
}
