package backend.rule

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post

object RuleModule : ControllerModule() {
    override fun configure() {
        route<RuleController> { controller ->
            path("rule") {
                get("as/array", controller::getAllRules, Roles.AUTH)
                get("as/array/with/department", controller::getAllRulesWithDepartment, Roles.AUTH)
                post("insert", controller::insertRule, Roles.AUTH)
                post("update", controller::updateRule, Roles.AUTH)
                post("delete", controller::deleteRule, Roles.AUTH)
            }
        }
    }
}
