package data.bean

import com.datastax.oss.driver.api.mapper.annotations.Entity
import com.datastax.oss.driver.api.mapper.annotations.PartitionKey
import com.datastax.oss.driver.api.mapper.annotations.PropertyStrategy
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.util.UUID

/**
 * @author Michael Gense
 * @since 23.08.2022
 */
@Entity
@PropertyStrategy(mutable = false)
@JsonIgnoreProperties(ignoreUnknown = true)
data class StudyRegulation(
    @PartitionKey(1) var studyRegulationId: UUID,
    val name: String,
    val department: String,
    val conditions: MutableList<String> = mutableListOf(),
    val creditPoints: MutableList<String> = mutableListOf(),
    val maxCp: String,
    val examAmount: MutableList<Int> = mutableListOf(),
    val examPassed: MutableList<Int> = mutableListOf(),
    val university: MutableList<String> = mutableListOf(),
    val examConditions: MutableList<MutableList<String>> = mutableListOf(),
    val classifier: UUID?
)
