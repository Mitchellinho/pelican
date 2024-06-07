package backend.applicant

import com.google.inject.Inject
import core.security.helpers.getUserId
import core.security.helpers.isAdmin
import data.bean.Applicant
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
import util.all

/**
 * @author Michael
 * @since 28.09.2022
 */
class ApplicantController @Inject constructor(
    private val applicantDao: ApplicantDao,
    private val applicationDao: ApplicationDao,
    private val userDao: UserDao
) {

    @OpenApi(
        path = "/backend/applicant/with/applicant/id",
        methods = [HttpMethod.GET],
        summary = "Find Applicant with their applicantId",
        tags = ["applicant"],
        queryParams = [
            OpenApiParam(
                "applicantId",
                type = String::class,
                description = "applicantId of the applicant to search"
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(Applicant::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun getApplicant(ctx: Context) {
        val applicantId = ctx.queryParamAsClass<UUID>("applicantId").get()
        // TODO: Change second part of if
        if (ctx.isAdmin() || applicantId == ctx.getUserId()) {
            ctx.json(this.applicantDao.get(applicantId).get() ?: throw NotFoundResponse())
        } else {
            throw NotFoundResponse()
        }
    }

    @OpenApi(
        path = "/backend/applicant/update",
        methods = [HttpMethod.POST],
        summary = "update existing Applicant",
        tags = ["applicant"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Applicant::class, type = ContentType.JSON)],
            description = "Applicant to be updated",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun updateApplicant(ctx: Context) {
        val applicantToUpdate = ctx.bodyAsClass<Applicant>()
        applicantToUpdate.mail = applicantToUpdate.mail.lowercase()
        val applications =
            this.applicationDao.getApplicationsFromApplicantId(applicantToUpdate.applicantId).get().all().get()
        if (ctx.isAdmin()) {
            this.applicantDao.update(applicantToUpdate)
            val user = this.userDao.get(applicantToUpdate.applicantId).get()
            user?.firstName = applicantToUpdate.firstName
            user?.lastName = applicantToUpdate.lastName
            user?.mail = applicantToUpdate.mail
            this.userDao.update(user!!)
            applications.forEach { application ->
                application?.city = applicantToUpdate.city
                application?.country = applicantToUpdate.country
                application?.firstName = applicantToUpdate.firstName
                application?.lastName = applicantToUpdate.lastName
                application?.mail = applicantToUpdate.mail
                application?.street = applicantToUpdate.street
                application?.university = applicantToUpdate.university
                this.applicationDao.update(application!!)
            }
        } else {
            throw ForbiddenResponse()
        }
    }
}
