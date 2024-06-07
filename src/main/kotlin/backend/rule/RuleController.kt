package backend.rule

import com.google.inject.Inject
import core.security.helpers.isAdmin
import data.bean.Rule
import data.dao.RuleDao
import io.javalin.http.ContentType
import io.javalin.http.Context
import io.javalin.http.ForbiddenResponse
import io.javalin.http.bodyAsClass
import io.javalin.http.queryParamAsClass
import io.javalin.openapi.HttpMethod
import io.javalin.openapi.OpenApi
import io.javalin.openapi.OpenApiContent
import io.javalin.openapi.OpenApiParam
import io.javalin.openapi.OpenApiRequestBody
import io.javalin.openapi.OpenApiResponse
import java.util.UUID.randomUUID
import util.all

/**
 * @author Michael
 * @since 07.09.2022
 */
class RuleController @Inject constructor(
    private val ruleDao: RuleDao
) {
    @OpenApi(
        path = "/backend/rule/as/array",
        methods = [HttpMethod.GET],
        summary = "Get all Rules",
        tags = ["rule"],
        responses = [
            OpenApiResponse(
                "200", content = [OpenApiContent(Array<Rule>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAllRules(ctx: Context) {
        if (ctx.isAdmin()) {
            ctx.json(this.ruleDao.getAllRules().get().all().get().toTypedArray())
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/rule/as/array/with/department",
        methods = [HttpMethod.GET],
        summary = "Get all Rules with current users department",
        tags = ["rule"],
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
                "200", content = [OpenApiContent(Array<Rule>::class, type = ContentType.JSON)]
            ),
            OpenApiResponse("400")
        ]
    )
    fun getAllRulesWithDepartment(ctx: Context) {
        val department = ctx.queryParamAsClass<String>("department").get()
        if (ctx.isAdmin()) {
            ctx.json(this.ruleDao.getAllRulesWithDepartment(department).get().all().get().toTypedArray())
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/rule/insert",
        methods = [HttpMethod.POST],
        summary = "Insert created Rule",
        tags = ["rule"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Rule::class, type = ContentType.JSON)],
            description = "Rule to be inserted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun insertRule(ctx: Context) {
        if (ctx.isAdmin()) {
            val ruleToCreate = ctx.bodyAsClass<Rule>()
            ruleToCreate.ruleId = randomUUID()
            this.ruleDao.insert(ruleToCreate)
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/rule/update",
        methods = [HttpMethod.POST],
        summary = "update existing Rule",
        tags = ["rule"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Rule::class, type = ContentType.JSON)],
            description = "Rule to be updated",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun updateRule(ctx: Context) {
        if (ctx.isAdmin()) {
            val ruleToUpdate = ctx.bodyAsClass<Rule>()
            this.ruleDao.update(ruleToUpdate)
        } else {
            throw ForbiddenResponse()
        }
    }

    @OpenApi(
        path = "/backend/rule/delete",
        methods = [HttpMethod.POST],
        summary = "Delete existing Rule",
        tags = ["rule"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(Rule::class, type = ContentType.JSON)],
            description = "Rule to be deleted",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun deleteRule(ctx: Context) {
        if (ctx.isAdmin()) {
            val ruleToDelete = ctx.bodyAsClass<Rule>()
            this.ruleDao.delete(ruleToDelete)
        } else {
            throw ForbiddenResponse()
        }
    }
}
