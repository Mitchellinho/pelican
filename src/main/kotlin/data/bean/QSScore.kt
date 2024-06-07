package data.bean

import com.datastax.oss.driver.api.mapper.annotations.Entity
import com.datastax.oss.driver.api.mapper.annotations.PartitionKey
import com.datastax.oss.driver.api.mapper.annotations.PropertyStrategy
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.util.UUID

/**
 * @author lauritzrasbach
 * @since 06.11.2023
 */
@Entity
@PropertyStrategy(mutable = false)
@JsonIgnoreProperties(ignoreUnknown = true)
data class QSScore(
    @PartitionKey(1) var id: UUID,
    var rank: Int,
    var score: Float,
    var university: String
)
