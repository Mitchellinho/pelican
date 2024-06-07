package backend.application

import com.google.inject.Inject
import core.security.PasswordHasher
import core.security.helpers.getUserId
import core.security.helpers.isAdmin
import data.bean.Applicant
import data.bean.Application
import data.bean.User
import data.dao.ApplicantDao
import data.dao.ApplicationDao
import data.dao.UserDao
import io.javalin.http.ContentType
import io.javalin.http.Context
import io.javalin.http.ForbiddenResponse
import io.javalin.http.NotFoundResponse
import io.javalin.http.bodyAsClass
import io.javalin.http.queryParamAsClass
import io.javalin.openapi.HttpMethod
import io.javalin.openapi.OpenApi
import io.javalin.openapi.OpenApiContent
import io.javalin.openapi.OpenApiParam
import io.javalin.openapi.OpenApiRequestBody
import io.javalin.openapi.OpenApiResponse
import java.util.UUID
import java.util.UUID.randomUUID
import util.IdentityManager
import util.all

/**
 * @author Michael
 * @since 31.08.2022
 */
class ApplicationController @Inject constructor(
    // private val args: core.config.Args,
    private val applicantDao: ApplicantDao,
    private val applicationDao: ApplicationDao,
    private val userDao: UserDao,
    private val identityManager: IdentityManager,
    private val passwordHasher: PasswordHasher
) {

    @OpenApi(
        path = "/backend/application/with/application/number",
        methods = [HttpMethod.GET],
        summary = "Find Application with their applicant number",
        tags = ["application"],
        queryParams = [
            OpenApiParam(
                "applicantNumber",
                type = String::class,
                description = "applicant number of the application to search"
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(Application::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun getApplication(ctx: Context) {
        val applicantNumber = ctx.queryParamAsClass<String>("applicantNumber").get()
        // TODO: Change second part of if
        if (ctx.isAdmin()) {
            ctx.json(this.applicationDao.get(applicantNumber).get() ?: throw NotFoundResponse())
        } else {
            throw NotFoundResponse()
        }
    }

    @OpenApi(
        path = "/backend/application/as/array/with/applicationId",
        methods = [HttpMethod.GET],
        summary = "Get all Applications with given ApplicantId",
        tags = ["application"],
        queryParams = [
            OpenApiParam(
                "applicantId",
                type = String::class,
                description = "Id of the current user"
            )
        ],
        responses = [
            OpenApiResponse
            ("200", content = [OpenApiContent(Array<Application>::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun getApplicationsWithApplicantId(ctx: Context) {
        val applicantId = ctx.queryParamAsClass<UUID>("applicantId").get()
        if (ctx.isAdmin() || applicantId == ctx.getUserId()) {
            ctx.json(this.applicationDao.getApplicationsFromApplicantId(applicantId).get().all().get().toTypedArray())
        } else {
            throw NotFoundResponse()
        }
    }

    @OpenApi(
        path = "/backend/application/as/array",
        methods = [HttpMethod.GET],
        summary = "Get all Applications",
        tags = ["application"],
        responses = [
            OpenApiResponse(
                "200", content = [OpenApiContent(Array<Application>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAllApplications(ctx: Context) {
        if (ctx.isAdmin()) {
            ctx.json(this.applicationDao.getAllApplications().get().all().get().toTypedArray())
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/application/as/array/with/department",
        methods = [HttpMethod.GET],
        summary = "Get all Applications with given department",
        tags = ["application"],
        queryParams = [
            OpenApiParam(
                "department",
                type = String::class,
                description = "department of the current user"
            )
        ],
        responses = [
            OpenApiResponse
            ("200", content = [OpenApiContent(Array<Application>::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun getApplicationsWithDepartment(ctx: Context) {
        if (ctx.isAdmin()) {
            val department = ctx.queryParamAsClass<String>("department").get()
            ctx.json(this.applicationDao.getAllApplicationsWithDepartment(department).get().all().get().toTypedArray())
        } else {
            throw NotFoundResponse()
        }
    }

    @OpenApi(
        path = "/backend/application/as/array/with/semester",
        methods = [HttpMethod.GET],
        summary = "Get all Applications with given semester",
        tags = ["application"],
        queryParams = [
            OpenApiParam(
                "semester",
                type = String::class,
                description = "semester of the application"
            )
        ],
        responses = [
            OpenApiResponse
            ("200", content = [OpenApiContent(Array<Application>::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun getApplicationsWithSemester(ctx: Context) {
        val semester = ctx.queryParamAsClass<String>("semester").get()
        if (ctx.isAdmin()) {
            ctx.json(this.applicationDao.getApplicationsWithSemester(semester).get().all().get().toTypedArray())
        } else {
            throw NotFoundResponse()
        }
    }

    @OpenApi(
        path = "/backend/application/as/array/with/semester/and/department",
        methods = [HttpMethod.GET],
        summary = "Get all Applications with given semester and department",
        tags = ["application"],
        queryParams = [
            OpenApiParam(
                "semester",
                type = String::class,
                description = "semester of the applications"
            ),
            OpenApiParam(
                "department",
                type = String::class,
                description = "department of the current user"
            )
        ],
        responses = [
            OpenApiResponse
            ("200", content = [OpenApiContent(Array<Application>::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun getApplicationWithSemAndDep(ctx: Context) {
        val semester = ctx.queryParamAsClass<String>("semester").get()
        val department = ctx.queryParamAsClass<String>("department").get()
        if (ctx.isAdmin()) {
            ctx.json(
                this.applicationDao
                    .getApplicationsWithSemesterAndDepartment(semester, department).get().all().get().toTypedArray()
            )
        } else {
            throw NotFoundResponse()
        }
    }

    @OpenApi(
        path = "/backend/application/insert",
        methods = [HttpMethod.POST],
        summary = "Insert created Application",
        tags = ["application"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Application::class, type = ContentType.JSON)],
            description = "Application to be inserted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun insertApplication(ctx: Context) {
        if (ctx.isAdmin()) {
            val randomUUID = randomUUID()
            val applicationToCreate = ctx.bodyAsClass<Application>()
            applicationToCreate.mail = applicationToCreate.mail.lowercase()
            val foundApplicant = identityManager.findExistingApplicant(
                applicationToCreate.mail,
                applicationToCreate.firstName, applicationToCreate.lastName, applicationToCreate.street
            )
            if (foundApplicant == null) {
                applicationToCreate.applicantId = randomUUID
                val password = passwordHasher.createRandomPassword()
                val user = User(
                    userId = randomUUID,
                    lastName = applicationToCreate.lastName,
                    firstName = applicationToCreate.firstName,
                    username = applicationToCreate.mail,
                    mail = applicationToCreate.mail,
                    password = passwordHasher.hash(password),
                    userType = "Applicant",
                    department = applicationToCreate.department
                )
                val newApplications = mutableListOf<String>()
                newApplications.add(applicationToCreate.applicationNumber)
                val applicant = Applicant(
                    applicantId = randomUUID,
                    applications = newApplications,
                    birthOfDate = "",
                    city = applicationToCreate.city,
                    country = applicationToCreate.country,
                    degree = "",
                    firstName = applicationToCreate.firstName,
                    gender = "",
                    lastName = applicationToCreate.lastName,
                    mail = applicationToCreate.mail,
                    nationality = "",
                    salutation = "",
                    street = applicationToCreate.street,
                    university = applicationToCreate.university
                )
                this.applicationDao.insert(applicationToCreate)
                this.userDao.insert(user)
                this.applicantDao.insert(applicant)

//                val email = createPreconfiguredEmail()
//                email.subject = "Account Creation"
//                email.setMsg(
//                    "Ihr Account wurde erfolgreich erstellt. Sie können sich mit ihrer E-Mail " +
//                        "und dem Paswsort: " + password + " anmelden"
//                )
//                email.addTo(user.mail)
//
//                email.send()
            } else {
                print("User does exist")
                applicationToCreate.applicantId = foundApplicant.applicantId
                if (!foundApplicant.applications.contains(applicationToCreate.applicationNumber)) {
                    foundApplicant.applications.add(applicationToCreate.applicationNumber)
                    foundApplicant.city = applicationToCreate.city
                    foundApplicant.country = applicationToCreate.country
                    foundApplicant.street = applicationToCreate.street
                    foundApplicant.university = applicationToCreate.university
                    foundApplicant.lastName = applicationToCreate.lastName
                    foundApplicant.firstName = applicationToCreate.firstName
                    foundApplicant.mail = applicationToCreate.mail
                    // insert created Application and update Applicant
                    this.applicationDao.insert(applicationToCreate)
                    this.applicantDao.update(foundApplicant)
                }
            }
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/application/update",
        methods = [HttpMethod.POST],
        summary = "update existing Application",
        tags = ["application"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Application::class, type = ContentType.JSON)],
            description = "Application to be updated",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun updateApplication(ctx: Context) {
        val applicationToUpdate = ctx.bodyAsClass<Application>()
        if (ctx.isAdmin()) {
            applicationToUpdate.mail = applicationToUpdate.mail.lowercase()
            val user = this.userDao.get(applicationToUpdate.applicantId).get() ?: throw NotFoundResponse()
            val applicant = this.applicantDao.get(applicationToUpdate.applicantId).get() ?: throw NotFoundResponse()
            val otherApplications = this.applicationDao.getApplicationsFromApplicantId(
                applicant.applicantId
            ).get().all().get()
            user.lastName = applicationToUpdate.lastName
            user.firstName = applicationToUpdate.firstName
            user.department = applicationToUpdate.department
            user.mail = applicationToUpdate.mail
            user.username = applicationToUpdate.mail
            applicant.firstName = applicationToUpdate.firstName
            applicant.lastName = applicationToUpdate.lastName
            applicant.mail = applicationToUpdate.mail
            applicant.street = applicationToUpdate.street
            applicant.university = applicationToUpdate.university
            otherApplications.forEach { application ->
                if (application != null) {
                    application.firstName = applicationToUpdate.firstName
                    application.lastName = applicationToUpdate.lastName
                    application.mail = applicationToUpdate.mail
                    application.city = applicationToUpdate.city
                    application.country = applicationToUpdate.country
                    application.street = applicationToUpdate.street
                    application.university = applicationToUpdate.university
                    this.applicationDao.update(application)
                }
            }
            this.applicationDao.update(applicationToUpdate)
            this.userDao.update(user)
            this.applicantDao.update(applicant)
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/application/delete",
        methods = [HttpMethod.POST],
        summary = "Delete existing Application",
        tags = ["application"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Application::class, type = ContentType.JSON)],
            description = "Application to be deleted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun deleteApplication(ctx: Context) {
        val applicationToDelete = ctx.bodyAsClass<Application>()
        if (ctx.isAdmin()) {
            this.identityManager.deleteApplication(applicationToDelete)
        } else {
            throw ForbiddenResponse()
        }
    }
}
