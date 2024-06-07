package data.bean

import com.datastax.oss.driver.api.mapper.annotations.Entity
import com.datastax.oss.driver.api.mapper.annotations.PartitionKey
import com.datastax.oss.driver.api.mapper.annotations.PropertyStrategy
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.time.Instant
import java.util.UUID

/**
 * @author lauritzrasbach
 * @since 06.11.2023
 */
@Entity
@PropertyStrategy(mutable = false)
@JsonIgnoreProperties(ignoreUnknown = true)
data class Classifier(
    @PartitionKey(1) var id: UUID,
    var created: Instant,
    var single_label_score: Float,
    var single_label_score_balanced: Float,
    var true_positives: Int,
    var true_negatives: Int,
    var false_positives: Int,
    var false_negatives: Int,
    var multi_label_score: Float,
    var semester_trained_on: MutableList<String> = mutableListOf(),
    var balanced_training: Boolean,
    var max_depth: Int,
    var min_samples_leaf: Int,
    var study_regulation: String
)
