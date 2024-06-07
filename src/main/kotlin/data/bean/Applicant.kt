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
data class Applicant(
    @PartitionKey(1) var applicantId: UUID,
    var lastName: String,
    var firstName: String,
    var gender: String,
    var salutation: String,
    var mail: String,
    var country: String,
    var city: String,
    var street: String,
    var nationality: String?,
    var birthOfDate: String?,
    var applications: MutableList<String> = mutableListOf(),
    var degree: String?,
    var university: String?
)
