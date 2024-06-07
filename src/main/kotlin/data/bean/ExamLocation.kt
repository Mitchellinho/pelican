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
data class ExamLocation(
    @PartitionKey(1) var examLocationId: UUID,
    val readOnly: Boolean,
    var zipCode: String,
    var city: String,
    var street: String,
    var houseNumber: String,
    var designation: String,
    var department: String,
    var description: String,
    var inUse: Boolean
)
