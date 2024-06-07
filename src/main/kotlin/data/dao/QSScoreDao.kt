package data.dao

import com.datastax.oss.driver.api.core.MappedAsyncPagingIterable
import com.datastax.oss.driver.api.mapper.annotations.Dao
import com.datastax.oss.driver.api.mapper.annotations.Query
import com.datastax.oss.driver.api.mapper.annotations.Select
import data.bean.QSScore
import java.util.UUID
import java.util.concurrent.CompletableFuture

/**
 * @author lauritzrasbach
 * @since 06.11.2023
 */
@Dao
interface QSScoreDao : BaseDao<QSScore> {

    /**
     * Get QS score with id
     */
    @Select
    fun get(id: UUID): CompletableFuture<QSScore?>

    /**
     * Get all QS Scores
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.q_s_score"
    )
    fun getAllQSScores(): CompletableFuture<MappedAsyncPagingIterable<QSScore?>>
}
