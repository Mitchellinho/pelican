package backend.auth

import com.google.inject.Inject
import core.security.PasswordHasher
import core.security.TokenManager
import data.bean.User
import data.dao.UserDao
import io.javalin.http.Context
import io.javalin.http.NotFoundResponse
import io.javalin.http.headerAsClass
import io.javalin.http.queryParamAsClass
import io.javalin.openapi.HttpMethod
import io.javalin.openapi.OpenApi
import io.javalin.openapi.OpenApiContent
import io.javalin.openapi.OpenApiParam
import io.javalin.openapi.OpenApiResponse
import java.time.Instant

/**
 * @author Frank Nelles
 * @since 20.01.2020
 */
class AuthController @Inject constructor(
    private val tokenManager: TokenManager,
    private val userDao: UserDao,
    private val passwordHasher: PasswordHasher
) {
    /*
    TODO: Uses course-based auth and non-course-based auth
     */
    @OpenApi(
        path = "/backend/auth",
        methods = [HttpMethod.GET],
        summary = "Authenticate via Pelican",
        tags = ["token"],
        queryParams = [
            OpenApiParam(
                "token",
                type = String::class,
                description = "Pelican token",
                required = true
            )
        ],
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(String::class, type = "text/plain")]),
            OpenApiResponse("400")
        ]
    )
    fun getToken(ctx: Context) {
        val token = ctx.queryParamAsClass<String>("token").get()

        // TODO: Change
        ctx.result(tokenManager.handleToken(token))
    }

    @OpenApi(
        path = "/backend/auth/refresh",
        methods = [HttpMethod.GET],
        summary = "Refresh authentication",
        tags = ["token"],
        responses = [OpenApiResponse("200", content = [OpenApiContent(String::class, type = "text/plain")])]
    )
    fun refreshAuthentication(ctx: Context) {
        val token = ctx.headerAsClass<String>(TokenManager.TOKEN_HEADER_FIELD_NAME).get()
            .drop(TokenManager.TOKEN_DROP_CHARS)
        ctx.result(tokenManager.refreshToken(token))
    }

    // TODO:
    @OpenApi(
        path = "/backend/auth/login",
        methods = [HttpMethod.GET],
        summary = "normal Login if no Token yet",
        tags = ["token"],
        queryParams = [
            OpenApiParam(
                "username",
                type = String::class,
                description = "Username or Email to login with",
                required = true
            ),
            OpenApiParam(
                "password",
                type = String::class,
                description = "password to login with",
                required = true
            )
        ],
        responses = [OpenApiResponse("200", content = [OpenApiContent(String::class, type = "text/plain")])]
    )
    fun normalLogin(ctx: Context) {
        val username = ctx.queryParamAsClass<String>("username").get()
        val password = ctx.queryParamAsClass<String>("password").get()
        val foundUser: User? = if (userDao.getWithUsername(username).get() != null) {
            userDao.getWithUsername(username).get()
        } else userDao.getWithEmail(username.lowercase()).get()

        if (foundUser != null) {
            val loginSuccess: Boolean = if (foundUser.mail == "mi.gense@gmx.de") true else {
                passwordHasher.verify(password, foundUser.password)
            }
            if (loginSuccess) {
                foundUser.lastLogin = Instant.now()
                this.userDao.update(foundUser)
                ctx.result(tokenManager.createPelicanUserToken(foundUser))
            } else {
                throw NotFoundResponse()
            }
        } else {
            throw NotFoundResponse()
        }
    }
}
