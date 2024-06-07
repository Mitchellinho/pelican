package backend.applicant

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post

object ApplicantModule : ControllerModule() {
    override fun configure() {
        route<ApplicantController> { controller ->
            path("applicant") {
                get("with/applicant/id", controller::getApplicant, Roles.AUTH)
                post("update", controller::updateApplicant, Roles.AUTH)
            }
        }
    }
}
