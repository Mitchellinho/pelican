package data.bean

import com.datastax.oss.driver.api.mapper.annotations.Entity
import com.datastax.oss.driver.api.mapper.annotations.PartitionKey
import com.datastax.oss.driver.api.mapper.annotations.PropertyStrategy
import java.time.Instant
import java.util.UUID

/**
 * @author Michael Gense
 * @since 30.06.2022
 */
@Entity
@PropertyStrategy(mutable = false)
data class User(
    @PartitionKey(1) var userId: UUID,
    var lastName: String,
    var firstName: String,
    var username: String,
    var mail: String,
    var password: String,
    var userType: String,
    var department: String,
    var lastLogin: Instant = Instant.now()
) {
    companion object {
        const val EMPTY_FIELD = "-"
    }
}
