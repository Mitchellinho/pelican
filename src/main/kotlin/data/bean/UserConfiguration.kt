package data.bean

import com.datastax.oss.driver.api.mapper.annotations.Entity
import com.datastax.oss.driver.api.mapper.annotations.PartitionKey
import com.datastax.oss.driver.api.mapper.annotations.PropertyStrategy
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.util.UUID

/**
 * @author Frank Nelles
 * @since 09.10.2021
 */
@Entity
@PropertyStrategy(mutable = false)
data class UserConfiguration(
    @PartitionKey(1) val userId: UUID,
    val userConfiguration: UserConfigurationObject
)

/**
 * @author Frank Nelles
 * @since 09.10.2021
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class UserConfigurationObject(
    val introduction: IntroductionConfiguration = IntroductionConfiguration()
)

/**
 * @author Frank Nelles
 * @since 09.10.2021
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class IntroductionConfiguration(
    val hideIntroduction: Boolean = false,
    val markAsRead: MutableList<String> = mutableListOf()
)
