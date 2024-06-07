package data.bean

import com.datastax.oss.driver.api.mapper.annotations.Entity
import com.datastax.oss.driver.api.mapper.annotations.PartitionKey
import com.datastax.oss.driver.api.mapper.annotations.PropertyStrategy
import java.util.UUID

/**
 * @author Michael Gense
 * @since 23.08.2022
 */
@Entity
@PropertyStrategy(mutable = false)
data class Rule(
    @PartitionKey(1) var ruleId: UUID,
    var university: String,
    var appliedFor: UUID,
    var isActive: Boolean,
    var isSystemGenerated: Boolean,
    var appliedForName: String,
    var log: String,
    var condition: MutableList<String> = mutableListOf(),
    var serialLetter: String,
    var newStatus: String,
    var comment: String,
    var department: String
)
