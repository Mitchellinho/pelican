package backend.qsScore

import com.google.inject.Inject
import data.bean.*
import data.dao.QSScoreDao
import io.javalin.http.ContentType
import io.javalin.http.Context
import io.javalin.http.NotFoundResponse
import io.javalin.http.queryParamAsClass
import io.javalin.openapi.HttpMethod
import io.javalin.openapi.OpenApi
import io.javalin.openapi.OpenApiContent
import io.javalin.openapi.OpenApiParam
import io.javalin.openapi.OpenApiResponse
import java.util.UUID
import util.all

/**
 * @author Michael
 * @since 31.08.2022
 */
class QSScoreController @Inject constructor(
    private val qsScoreDao: QSScoreDao
) {

    @OpenApi(
        path = "/backend/qsscore",
        methods = [HttpMethod.GET],
        summary = "Find qsScore with ID",
        tags = ["qsscore"],
        queryParams = [
            OpenApiParam(
                "id",
                type = String::class,
                description = "ID of QS Score"
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(QSScore::class, type = ContentType.JSON)]),
            OpenApiResponse("400")
        ]
    )
    fun get(ctx: Context) {
        val id = ctx.queryParamAsClass<UUID>("id").get()
        ctx.json(this.qsScoreDao.get(id).get() ?: throw NotFoundResponse())
    }

    @OpenApi(
        path = "/backend/qsscore/as/array",
        methods = [HttpMethod.GET],
        summary = "Get all qsScores",
        tags = ["qsscore"],
        responses = [
            OpenApiResponse(
                "200", content = [OpenApiContent(Array<QSScore>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAllQSScores(ctx: Context) {
        ctx.json(this.qsScoreDao.getAllQSScores().get().all().get().toTypedArray())
    }
}
