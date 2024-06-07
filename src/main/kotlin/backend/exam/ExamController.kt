package backend.exam

import com.google.inject.Inject
import core.security.helpers.isAdmin
import data.bean.Exam
import data.dao.ExamDao
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
class ExamController @Inject constructor(
    private val examDao: ExamDao
) {
    @OpenApi(
        path = "/backend/exam",
        methods = [HttpMethod.GET],
        summary = "Find Exam with its Id",
        tags = ["exam"],
        queryParams = [
            OpenApiParam(
                "examId",
                type = String::class,
                description = "Id of the Exam to search"
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(Exam::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun getExam(ctx: Context) {
        val examId = ctx.queryParamAsClass<UUID>("examId").get()
        // TODO: Change second part of if
        ctx.json(this.examDao.get(examId).get() ?: throw NotFoundResponse())
    }

    @OpenApi(
        path = "/backend/exam/as/array",
        methods = [HttpMethod.GET],
        summary = "Get all Exams",
        tags = ["exam"],
        responses = [
            OpenApiResponse(
                "200", content = [OpenApiContent(Array<Exam>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAllExams(ctx: Context) {
        ctx.json(this.examDao.getAllExams().get().all().get().toTypedArray())
    }

    @OpenApi(
        path = "/backend/exam/as/array/with/department",
        methods = [HttpMethod.GET],
        summary = "Get all Exams with current users department",
        tags = ["exam"],
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
                "200", content = [OpenApiContent(Array<Exam>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAllExamsWithDepartment(ctx: Context) {
        val department = ctx.queryParamAsClass<String>("department").get()
        if (ctx.isAdmin()) {
            ctx.json(this.examDao.getAllExamsWithDepartment(department).get().all().get().toTypedArray())
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/exam/insert",
        methods = [HttpMethod.POST],
        summary = "Insert created Exam",
        tags = ["exam"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Exam::class, type = ContentType.JSON)],
            description = "Exam to be inserted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun insertExam(ctx: Context) {
        if (ctx.isAdmin()) {
            val examToCreate = ctx.bodyAsClass<Exam>()
            examToCreate.examId = UUID.randomUUID()
            this.examDao.insert(examToCreate)
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/exam/update",
        methods = [HttpMethod.POST],
        summary = "update existing Exam",
        tags = ["exam"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Exam::class, type = ContentType.JSON)],
            description = "Exam to be updated",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun updateExam(ctx: Context) {
        if (ctx.isAdmin()) {
            val examToUpdate = ctx.bodyAsClass<Exam>()
            this.examDao.update(examToUpdate)
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/exam/delete",
        methods = [HttpMethod.POST],
        summary = "Delete existing Exam",
        tags = ["exam"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Exam::class, type = ContentType.JSON)],
            description = "Exam to be deleted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun deleteExam(ctx: Context) {
        if (ctx.isAdmin()) {
            val examToDelete = ctx.bodyAsClass<Exam>()
            this.examDao.delete(examToDelete)
        } else {
            throw ForbiddenResponse()
        }
    }
}
