package backend.examLocation

import com.google.inject.Inject
import core.security.helpers.isAdmin
import data.bean.ExamLocation
import data.dao.ExamLocationDao
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
 * @since 21.09.2022
 */
class ExamLocationController @Inject constructor(
    private val examLocationDao: ExamLocationDao
) {
    @OpenApi(
        path = "/backend/examlocation",
        methods = [HttpMethod.GET],
        summary = "Find ExamLocation with its Id",
        tags = ["examlocation"],
        queryParams = [
            OpenApiParam(
                "examLocationId",
                type = String::class,
                description = "Id of the ExamLocation to search"
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(ExamLocation::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun getExamLocation(ctx: Context) {
        val examLocationId = ctx.queryParamAsClass<UUID>("examLocationId").get()
        // TODO: Change second part of if
        ctx.json(this.examLocationDao.get(examLocationId).get() ?: throw NotFoundResponse())
    }

    @OpenApi(
        path = "/backend/examlocation/as/array",
        methods = [HttpMethod.GET],
        summary = "Get all ExamLocations",
        tags = ["examlocation"],
        responses = [
            OpenApiResponse(
                "200", content = [OpenApiContent(Array<ExamLocation>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAllExamLocations(ctx: Context) {
        ctx.json(this.examLocationDao.getAllExamLocations().get().all().get().toTypedArray())
    }

    @OpenApi(
        path = "/backend/examlocation/as/array/with/department",
        methods = [HttpMethod.GET],
        summary = "Get all ExamLocations with current users department",
        tags = ["examlocation"],
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
                "200", content = [OpenApiContent(Array<ExamLocation>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAllExamLocationsWithDepartment(ctx: Context) {
        val department = ctx.queryParamAsClass<String>("department").get()
        if (ctx.isAdmin()) {
            ctx.json(
                this.examLocationDao
                    .getAllExamLocationsWithDepartment(department).get().all().get().toTypedArray()
            )
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/examlocation/insert",
        methods = [HttpMethod.POST],
        summary = "Insert created ExamLocation",
        tags = ["examlocation"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(ExamLocation::class, type = ContentType.JSON)],
            description = "ExamLocation to be inserted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun insertExamLocation(ctx: Context) {
        if (ctx.isAdmin()) {
            val examLocationToCreate = ctx.bodyAsClass<ExamLocation>()
            examLocationToCreate.examLocationId = UUID.randomUUID()
            this.examLocationDao.insert(examLocationToCreate)
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/examlocation/update",
        methods = [HttpMethod.POST],
        summary = "update existing ExamLocation",
        tags = ["examlocation"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(ExamLocation::class, type = ContentType.JSON)],
            description = "ExamLocation to be updated",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun updateExamLocation(ctx: Context) {
        if (ctx.isAdmin()) {
            val examLocationToUpdate = ctx.bodyAsClass<ExamLocation>()
            this.examLocationDao.update(examLocationToUpdate)
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/examlocation/delete",
        methods = [HttpMethod.POST],
        summary = "Delete existing ExamLocation",
        tags = ["examlocation"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(ExamLocation::class, type = ContentType.JSON)],
            description = "ExamLocation to be deleted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun deleteExamLocation(ctx: Context) {
        if (ctx.isAdmin()) {
            val examLocationToDelete = ctx.bodyAsClass<ExamLocation>()
            this.examLocationDao.delete(examLocationToDelete)
        } else {
            throw ForbiddenResponse()
        }
    }
}
