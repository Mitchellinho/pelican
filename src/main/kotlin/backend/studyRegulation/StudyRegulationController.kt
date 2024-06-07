package backend.studyRegulation

import com.google.inject.Inject
import core.security.helpers.isAdmin
import data.bean.StudyRegulation
import data.dao.StudyRegulationDao
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
import util.all

/**
 * @author Michael
 * @since 03.09.2022
 */
class StudyRegulationController @Inject constructor(
    private val studyRegulationDao: StudyRegulationDao
) {

    @OpenApi(
        path = "/backend/studyregulation",
        methods = [HttpMethod.GET],
        summary = "Find studyRegulation with ID",
        tags = ["studyregulation"],
        queryParams = [
            OpenApiParam(
                "studyRegulationId",
                type = String::class,
                description = "ID of StudyRegulation"
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(StudyRegulation::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun get(ctx: Context) {
        val studyRegulationId = ctx.queryParamAsClass<UUID>("studyRegulationId").get()
        ctx.json(this.studyRegulationDao.get(studyRegulationId).get() ?: throw NotFoundResponse())
    }

    @OpenApi(
        path = "/backend/studyregulation/as/array",
        methods = [HttpMethod.GET],
        summary = "Get all StudyRegulations",
        tags = ["studyregulation"],
        responses = [
            OpenApiResponse(
                "200", content = [OpenApiContent(Array<StudyRegulation>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAll(ctx: Context) {
        ctx.json(this.studyRegulationDao.getAllRegulations().get().all().get().toTypedArray())
    }

    @OpenApi(
        path = "/backend/studyregulation/as/array/with/department",
        methods = [HttpMethod.GET],
        summary = "Get all StudyRegulations with current users department",
        tags = ["studyregulation"],
        queryParams = [
            OpenApiParam(
                "department",
                type = String::class,
                description = "current Users department",
                required = true
            )
        ],
        responses = [
            OpenApiResponse(
                "200", content = [OpenApiContent(Array<StudyRegulation>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAllWithDepartment(ctx: Context) {
        val department = ctx.queryParamAsClass<String>("department").get()
        if (ctx.isAdmin()) {
            ctx.json(this.studyRegulationDao.getRegulationsWithDepartment(department).get().all().get().toTypedArray())
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/studyregulation/with/degree/and/department",
        methods = [HttpMethod.GET],
        summary = "Get StudyRegulation with name and department",
        tags = ["studyregulation"],
        queryParams = [
            OpenApiParam(
                "degree",
                type = String::class,
                description = "name of the Studyregulation you want to search",
                required = true
            ),
            OpenApiParam(
                "department",
                type = String::class,
                description = "department of the Studyregulation you want to search",
                required = true
            )
        ],
        responses = [
            OpenApiResponse(
                "200", content = [OpenApiContent(StudyRegulation::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getWithDegreeAndDepartment(ctx: Context) {
        val degree = ctx.queryParamAsClass<String>("degree").get()
        val department = ctx.queryParamAsClass<String>("department").get()
        if (ctx.isAdmin()) {
            ctx.json(
                this.studyRegulationDao.getWithNameAndDepartment(degree, department).get()
                    ?: throw NotFoundResponse()
            )
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/studyregulation/insert",
        methods = [HttpMethod.POST],
        summary = "Insert created StudyRegulation",
        tags = ["studyregulation"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(StudyRegulation::class, type = ContentType.JSON)],
            description = "StudyRegulation to be inserted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun insertStudyRegulation(ctx: Context) {
        if (ctx.isAdmin()) {
            val studyRegulationToCreate = ctx.bodyAsClass<StudyRegulation>()
            studyRegulationToCreate.studyRegulationId = randomUUID()
            this.studyRegulationDao.insert(studyRegulationToCreate)
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/studyregulation/update",
        methods = [HttpMethod.POST],
        summary = "update existing StudyRegulation",
        tags = ["studyregulation"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(StudyRegulation::class, type = ContentType.JSON)],
            description = "StudyRegulation to be updated",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun updateStudyRegulation(ctx: Context) {
        if (ctx.isAdmin()) {
            val studyRegulationToUpdate = ctx.bodyAsClass<StudyRegulation>()
            this.studyRegulationDao.update(studyRegulationToUpdate)
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/studyregulation/delete",
        methods = [HttpMethod.POST],
        summary = "Delete existing StudyRegulation",
        tags = ["studyregulation"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(StudyRegulation::class, type = ContentType.JSON)],
            description = "StudyRegulation to be deleted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun deleteStudyRegulation(ctx: Context) {
        if (ctx.isAdmin()) {
            val studyRegulationToDelete = ctx.bodyAsClass<StudyRegulation>()
            this.studyRegulationDao.delete(studyRegulationToDelete)
        } else {
            throw ForbiddenResponse()
        }
    }
}
