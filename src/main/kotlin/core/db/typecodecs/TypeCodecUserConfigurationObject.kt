package core.db.typecodecs

import com.datastax.oss.driver.api.core.ProtocolVersion
import com.datastax.oss.driver.api.core.type.DataType
import com.datastax.oss.driver.api.core.type.DataTypes
import com.datastax.oss.driver.api.core.type.codec.TypeCodec
import com.datastax.oss.driver.api.core.type.codec.TypeCodecs
import com.datastax.oss.driver.api.core.type.reflect.GenericType
import com.fasterxml.jackson.module.kotlin.readValue
import core.json.JacksonModule
import data.bean.UserConfigurationObject
import java.nio.ByteBuffer

/**
 * @author Frank Nelles
 * @since 09.01.2022
 */
class TypeCodecUserConfigurationObject : TypeCodec<UserConfigurationObject> {
    override fun format(value: UserConfigurationObject?): String =
        JacksonModule.mapper.writeValueAsString(value)

    override fun parse(value: String?): UserConfigurationObject? = value?.let {
        JacksonModule.mapper.readValue<UserConfigurationObject>(it)
    }

    override fun encode(
        value: UserConfigurationObject?,
        protocolVersion: ProtocolVersion
    ): ByteBuffer? = value?.let {
        TypeCodecs.TEXT.encode(JacksonModule.mapper.writeValueAsString(value), protocolVersion)
    }

    override fun getCqlType(): DataType = DataTypes.TEXT
    override fun getJavaType(): GenericType<UserConfigurationObject> =
        GenericType.of(UserConfigurationObject::class.java)

    override fun decode(
        bytes: ByteBuffer?,
        protocolVersion: ProtocolVersion
    ): UserConfigurationObject? = bytes?.let { TypeCodecs.TEXT.decode(it, protocolVersion) }
        ?.let { JacksonModule.mapper.readValue<UserConfigurationObject>(it) }
}
