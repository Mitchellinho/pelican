package data.bean

import com.datastax.oss.driver.api.mapper.annotations.Entity
import com.datastax.oss.driver.api.mapper.annotations.PartitionKey
import com.datastax.oss.driver.api.mapper.annotations.PropertyStrategy
import java.time.Instant
import java.util.UUID

/**
 * @author Michael Gense
 * @since 23.08.2022
 */
@Entity
@PropertyStrategy(mutable = false)
data class Exam(
    @PartitionKey(1) var examId: UUID,
    var caption: String,
    var courseUrl: String,
    var studyRegulationId: UUID,
    var studyRegulationName: String,
    var examLocationId: MutableList<UUID> = mutableListOf(),
    var examDuration: Int,
    var semester: String,
    var department: String,
    var notes: String,
    var startTime: MutableList<Instant> = mutableListOf(),
    var endTime: MutableList<Instant> = mutableListOf()
)
