package core.db

import com.datastax.oss.driver.api.core.CqlSession
import com.datastax.oss.driver.api.core.config.DefaultDriverOption
import com.datastax.oss.driver.api.core.config.DriverConfigLoader
import com.google.inject.Inject
import com.google.inject.Provider
import core.config.Args
import core.db.typecodecs.TypeCodecUserConfigurationObject
import java.time.Duration

/**
 * @author Frank Nelles
 * @since 11.06.2020
 */
@Suppress("MethodOverloading")
class CassandraConnector @Inject constructor(
    args: Args
) : Provider<CqlSession> {
    val session: CqlSession = CqlSession.builder().apply {
        addContactPoints(args.databaseNodeAddresses)
        withLocalDatacenter(args.datacenter)
        addTypeCodecs(
            // ExtraTypeCodecs.enumNamesOf(SomeEnumClass::class.java),
            TypeCodecUserConfigurationObject()
        )
        if (args.increaseCassandraTimeout) {
            val configBuilder: DriverConfigLoader =
                DriverConfigLoader.programmaticBuilder()
                    .withDuration(DefaultDriverOption.CONNECTION_CONNECT_TIMEOUT, Duration.ofSeconds(120))
                    .withDuration(DefaultDriverOption.REQUEST_TIMEOUT, Duration.ofSeconds(120))
                    .endProfile()
                    .build()
            withConfigLoader(configBuilder)
        }
    }
        .build()

    /**
     * Get cql session
     */
    override fun get(): CqlSession = session

    /**
     * Close database session
     */
    fun close(): Unit = session.close()
}
