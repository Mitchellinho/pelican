
import com.google.inject.Inject
import core.security.helpers.isAdmin
import data.bean.*
import data.dao.ClassifierDao
import io.javalin.http.*
import io.javalin.http.ContentType
import io.javalin.openapi.*
import java.time.Instant
import java.util.UUID
import util.IdentityManager
import util.all

/**
 * @author Michael
 * @since 31.08.2022
 */
class ClassifierController @Inject constructor(
    private val classifierDao: ClassifierDao,
    private val identityManager: IdentityManager
) {

    @OpenApi(
        path = "/backend/classifier",
        methods = [HttpMethod.GET],
        summary = "Find classifier with ID",
        tags = ["classifier"],
        queryParams = [
            OpenApiParam(
                "id",
                type = String::class,
                description = "ID of classifier"
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(Classifier::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun get(ctx: Context) {
        val id = ctx.queryParamAsClass<UUID>("id").get()
        ctx.json(this.classifierDao.get(id).get() ?: throw NotFoundResponse())
    }

    @OpenApi(
        path = "/backend/classifier/as/array",
        methods = [HttpMethod.GET],
        summary = "Get all classifiers",
        tags = ["classifier"],
        responses = [
            OpenApiResponse(
                "200", content = [OpenApiContent(Array<Classifier>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAllclassifiers(ctx: Context) {
        ctx.json(this.classifierDao.getAllClassifiers().get().all().get().toTypedArray())
    }

    @OpenApi(
        path = "/backend/classifier/insert",
        methods = [HttpMethod.POST],
        summary = "Insert created classifier",
        tags = ["classifier"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Classifier::class, type = ContentType.JSON)],
            description = "Classifier to be inserted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun insertClassifier(ctx: Context) {
        if (ctx.isAdmin()) {
            val classifierToCreate = ctx.bodyAsClass<Classifier>()

            classifierToCreate.created = Instant.now()

            // insert created Application and update Applicant
            this.classifierDao.insert(classifierToCreate)
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/classifier/delete",
        methods = [HttpMethod.POST],
        summary = "Delete existing Classifier",
        tags = ["classifier"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Classifier::class, type = ContentType.JSON)],
            description = "Classifier to be deleted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun deleteClassifier(ctx: Context) {
        if (ctx.isAdmin()) {
            val clfToDelete = ctx.bodyAsClass<Classifier>()
            this.classifierDao.delete(clfToDelete)
        } else {
            throw ForbiddenResponse()
        }
    }
}
