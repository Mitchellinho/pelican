package core

import com.fasterxml.jackson.core.JsonParseException
import core.json.JacksonModule.mapper
import io.javalin.http.BadRequestResponse
import io.javalin.http.Context

/**
 * Obtain a list of query parameters.
 */
fun Context.queryParamList(key: String): List<String> = this.queryParam(key)?.split(",") ?: listOf()

/**
 * Obtain a url encoded json object.
 */
inline fun <reified T> Context.queryParamJson(key: String): T? =
    this.queryParam(key)?.let {
        try {
            mapper.readValue(it, T::class.java)
        } catch (e: JsonParseException) {
            throw BadRequestResponse()
        }
    }
