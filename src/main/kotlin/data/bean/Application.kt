package data.bean

import com.datastax.oss.driver.api.mapper.annotations.Entity
import com.datastax.oss.driver.api.mapper.annotations.PartitionKey
import com.datastax.oss.driver.api.mapper.annotations.PropertyStrategy
import java.util.UUID

/**
 * @author Michael Gense
 * @since 30.06.2022
 */
@Entity
@PropertyStrategy(mutable = false)
data class Application(
    @PartitionKey(1) var applicationNumber: String,
    var admissionsOffice: String,
    var method: String,
    var applicantId: UUID,
    var lastName: String,
    var firstName: String,
    var mail: String,
    var appliedFor: UUID,
    var appliedForName: String,
    var university: String?,
    var semester: String,
    var alreadyApplied: Boolean,
    var department: String,
    var status: String,
    var city: String,
    var country: String,
    var street: String,
    var conditions: MutableList<String> = mutableListOf(),
    var cp: MutableList<String> = mutableListOf(),
    var inUse: Boolean,
    var exam: UUID?,
    var examIndex: Int?
)
