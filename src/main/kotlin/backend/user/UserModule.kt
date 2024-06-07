package backend.user

import core.routing.ControllerModule
import core.security.Roles
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post

/**
 * @author Leon Camus
 * @since 07.04.2020
 */
object UserModule : ControllerModule() {
    override fun configure() {
        route<UserController> { controller ->
            path("user") {
                get("as/array", controller::getAllUsers, Roles.AUTH)
                get("admin/verification", controller::verification, Roles.AUTH)
                get("as/array/with/department", controller::getAllUsersWithDepartment, Roles.AUTH)
                get("{userId}", controller::find, Roles.AUTH)
                post("insert", controller::insertUser, Roles.AUTH)
                post("update", controller::updateUser, Roles.AUTH)
                post("delete", controller::deleteUser, Roles.AUTH)
            }
        }

        route<UserConfigurationController> { controller ->
            path("config/user") {
                get("", controller::getUserConfiguration, Roles.AUTH)
                post("", controller::setUserConfiguration, Roles.AUTH)
            }
        }
    }
}
