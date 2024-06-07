package backend.email

import com.google.inject.Inject
import core.config.Args
import data.bean.User
import io.javalin.http.Context
import io.javalin.http.queryParamAsClass
import io.javalin.openapi.ContentType
import io.javalin.openapi.HttpMethod
import io.javalin.openapi.OpenApi
import io.javalin.openapi.OpenApiContent
import io.javalin.openapi.OpenApiParam
import io.javalin.openapi.OpenApiRequestBody
import io.javalin.openapi.OpenApiResponse
import org.apache.commons.mail.DefaultAuthenticator
import org.apache.commons.mail.SimpleEmail

/**
 * @author Joshua Storch
 * @since 19.11.2021
 */
class EmailController @Inject constructor(
    private val args: Args
) {
    @OpenApi(
        path = "/backend/email",
        methods = [HttpMethod.POST],
        summary = "Send an email",
        tags = ["email"],
        queryParams = [
            OpenApiParam(
                "receiver",
                description = "The receiver of the email",
                required = true,
                type = String::class
            ),
            OpenApiParam(
                "subject",
                description = "The subject for the email",
                required = true,
                type = String::class
            )
        ],
        requestBody = OpenApiRequestBody(
            description = "The message of the email",
            content = [OpenApiContent(String::class)],
            required = true
        ),
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(User::class, type = ContentType.JSON)]),
            OpenApiResponse("400"),
            OpenApiResponse("403"),
            OpenApiResponse("404")
        ]
    )
    fun sendEmail(ctx: Context) {
        val msg = ctx.body()
        val receiver = ctx.queryParamAsClass<String>("receiver").get()
        val subject = ctx.queryParamAsClass<String>("subject").get()

        val email = createPreconfiguredEmail()

        email.subject = subject
        email.setMsg(msg)
        email.addTo(receiver)

        email.send()
    }

    /**
     * get a preconfigured email object.
     * This function and the properties set in it should not be changed!
     */
    private fun createPreconfiguredEmail(): SimpleEmail {
        val email = SimpleEmail()
        email.hostName = args.mailSmtpHost
        email.isStartTLSEnabled = args.mailSmtpStartTls
        if (args.mailSmtpTls) {
            email.sslSmtpPort = args.mailSmtpPort.toString()
            email.isSSLOnConnect = args.mailSmtpTls
        } else {
            email.setSmtpPort(args.mailSmtpPort!!)
        }
        if (args.mailSmtpUsername != null && args.mailSmtpPassword != null) {
            email.setAuthenticator(DefaultAuthenticator(args.mailSmtpUsername, args.mailSmtpPassword))
        }
        email.setFrom(args.mailSmtpSender)

        return email
    }
}
