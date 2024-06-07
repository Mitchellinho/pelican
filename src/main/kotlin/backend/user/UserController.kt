package backend.user

import com.google.inject.Inject
import core.security.PasswordHasher
import core.security.helpers.getUserId
import core.security.helpers.isAdmin
import data.bean.Applicant
import data.bean.User
import data.dao.ApplicantDao
import data.dao.ApplicationDao
import data.dao.UserDao
import io.javalin.http.Context
import io.javalin.http.ForbiddenResponse
import io.javalin.http.NotFoundResponse
import io.javalin.http.bodyAsClass
import io.javalin.http.pathParamAsClass
import io.javalin.http.queryParamAsClass
import io.javalin.openapi.ContentType
import io.javalin.openapi.HttpMethod
import io.javalin.openapi.OpenApi
import io.javalin.openapi.OpenApiContent
import io.javalin.openapi.OpenApiParam
import io.javalin.openapi.OpenApiRequestBody
import io.javalin.openapi.OpenApiResponse
import java.util.UUID
import java.util.UUID.randomUUID
import util.all

/**
 * @author Frank Nelles
 * @since 13.06.2020
 */
class UserController @Inject constructor(
    private val userDao: UserDao,
    private val applicantDao: ApplicantDao,
    private val applicationDao: ApplicationDao,
    private val passwordHasher: PasswordHasher
) {
    @OpenApi(
        path = "/backend/user/{userId}",
        methods = [HttpMethod.GET],
        summary = "Find a user by id",
        tags = ["user"],
        pathParams = [
            OpenApiParam(
                "userId",
                description = "id of the user",
                type = String::class
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(User::class, type = ContentType.JSON)]),
            OpenApiResponse("400"),
            OpenApiResponse("403"),
            OpenApiResponse("404")
        ]
    )
    fun find(ctx: Context) {
        val userId = ctx.pathParamAsClass<UUID>("userId").get()

        if (ctx.isAdmin() || ctx.getUserId() == userId) {
            ctx.json(this.userDao.get(userId).get() ?: throw ForbiddenResponse())
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/user/as/array",
        methods = [HttpMethod.GET],
        summary = "Get All Users",
        tags = ["user"],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(Array<User>::class, type = ContentType.JSON)]),
            OpenApiResponse("400"),
            OpenApiResponse("403"),
            OpenApiResponse("404")
        ]
    )
    fun getAllUsers(ctx: Context) {
        if (ctx.isAdmin()) {
            ctx.json(this.userDao.getAllUsers().get().all().get().toTypedArray())
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/user/as/array/with/department",
        methods = [HttpMethod.GET],
        summary = "Get all Users with given department",
        tags = ["user"],
        queryParams = [
            OpenApiParam(
                "department",
                description = "department of the current user",
                type = String::class
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(Array<User>::class, type = ContentType.JSON)]),
            OpenApiResponse("400"),
            OpenApiResponse("403"),
            OpenApiResponse("404")
        ]
    )
    fun getAllUsersWithDepartment(ctx: Context) {
        val department = ctx.queryParamAsClass<String>(key = "department").get()

        if (ctx.isAdmin()) {
            ctx.json(this.userDao.getAllUsersWithDepartment(department).get().all().get().toTypedArray())
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/user/insert",
        methods = [HttpMethod.POST],
        summary = "Insert created User",
        tags = ["user"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(User::class, type = ContentType.JSON)],
            description = "User to be inserted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun insertUser(ctx: Context) {
        if (ctx.isAdmin()) {
            val userToCreate = ctx.bodyAsClass<User>()
            userToCreate.userId = randomUUID()
            userToCreate.mail = userToCreate.mail.lowercase()
            userToCreate.password = passwordHasher.hash(userToCreate.password)
            this.userDao.insert(userToCreate)
            if (userToCreate.userType == "Applicant") {
                val applicantToAdd = Applicant(
                    applicantId = userToCreate.userId,
                    birthOfDate = null,
                    city = "",
                    country = "",
                    degree = null,
                    firstName = userToCreate.firstName,
                    gender = "",
                    lastName = userToCreate.lastName,
                    mail = userToCreate.mail,
                    nationality = "",
                    salutation = "",
                    street = "",
                    university = ""
                )
                this.applicantDao.insert(applicantToAdd)
            }
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/user/update",
        methods = [HttpMethod.POST],
        summary = "Update existing User",
        tags = ["user"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(User::class, type = ContentType.JSON)],
            description = "User to be updated",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun updateUser(ctx: Context) {
        val userToUpdate = ctx.bodyAsClass<User>()
        if (ctx.isAdmin() || ctx.getUserId() == userToUpdate.userId) {
            userToUpdate.password = passwordHasher.hash(userToUpdate.password)
            userToUpdate.mail = userToUpdate.mail.lowercase()
            this.userDao.update(userToUpdate)
            if (userToUpdate.userType == "Applicant") {
                val applicantToUpdate = this.applicantDao.get(userToUpdate.userId).get() ?: throw NotFoundResponse()
                applicantToUpdate.mail = userToUpdate.mail
                applicantToUpdate.firstName = userToUpdate.firstName
                applicantToUpdate.lastName = userToUpdate.lastName
                this.applicantDao.update(applicantToUpdate)
                val applications =
                    this.applicationDao.getApplicationsFromApplicantId(applicantToUpdate.applicantId).get().all().get()
                applications.forEach { application ->
                    application?.firstName = userToUpdate.firstName
                    application?.lastName = userToUpdate.lastName
                    application?.mail = userToUpdate.mail
                    this.applicationDao.update(application!!)
                }
            }
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/user/delete",
        methods = [HttpMethod.POST],
        summary = "Delete existing User",
        tags = ["user"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(User::class, type = ContentType.JSON)],
            description = "User to be deleted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun deleteUser(ctx: Context) {
        if (ctx.isAdmin()) {
            val userToDelete = ctx.bodyAsClass<User>()
            this.userDao.delete(userToDelete)
            if (userToDelete.userType == "Applicant") {
                val applicantToDelete = this.applicantDao.get(userToDelete.userId).get() ?: throw NotFoundResponse()
                this.applicantDao.delete(applicantToDelete)
            }
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/user/admin/verification",
        methods = [HttpMethod.GET],
        summary = "Check if password is from admin to delete Semester",
        tags = ["user"],
        queryParams = [
            OpenApiParam(
                "password",
                description = "password of one of the admins",
                type = String::class
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(Boolean::class, type = ContentType.JSON)]),
            OpenApiResponse("400"),
            OpenApiResponse("403"),
            OpenApiResponse("404")
        ]
    )
    fun verification(ctx: Context) {
        val password = ctx.queryParamAsClass<String>("password").get()

        if (ctx.isAdmin()) {
            val admins = this.userDao.getAllWithType("Admin").get().all().get()
            var foundAdmin = false
            admins.forEach { admin ->
                if (this.passwordHasher.verify(password, admin!!.password)) {
                    foundAdmin = true
                }
            }
            if (foundAdmin) {
                ctx.json(true)
            } else {
                ctx.json(false)
            }
        } else {
            throw ForbiddenResponse()
        }
    }
}
