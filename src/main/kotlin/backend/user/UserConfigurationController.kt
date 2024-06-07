package backend.user

import com.google.inject.Inject
import core.security.helpers.getUserId
import data.bean.UserConfiguration
import data.bean.UserConfigurationObject
import data.dao.UserConfigurationDao
import io.javalin.http.Context
import io.javalin.http.bodyAsClass
import io.javalin.openapi.ContentType
import io.javalin.openapi.HttpMethod
import io.javalin.openapi.OpenApi
import io.javalin.openapi.OpenApiContent
import io.javalin.openapi.OpenApiRequestBody
import io.javalin.openapi.OpenApiResponse

/**
 * @author Frank Nelles
 * @since 10.01.2022
 */
class UserConfigurationController @Inject constructor(
    private val userConfigurationDao: UserConfigurationDao
) {
    @OpenApi(
        path = "/backend/config/user",
        methods = [HttpMethod.GET],
        summary = "Get the user configuration for the current user",
        tags = ["config"],
        responses = [
            OpenApiResponse("200", [OpenApiContent(UserConfigurationObject::class, type = ContentType.JSON)]),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun getUserConfiguration(ctx: Context) {
        ctx.json(
            userConfigurationDao
                .get(ctx.getUserId())
                .get()?.userConfiguration
                ?: UserConfigurationObject()
        )
    }

    @OpenApi(
        path = "/backend/config/user",
        methods = [HttpMethod.POST],
        summary = "Set the user configuration for the current user",
        tags = ["config"],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(UserConfigurationObject::class, type = ContentType.JSON)],
            description = "Configuration to be set",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    fun setUserConfiguration(ctx: Context) {
        userConfigurationDao.update(UserConfiguration(ctx.getUserId(), ctx.bodyAsClass())).get()
    }
}
