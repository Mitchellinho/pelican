package data.dao

import com.datastax.oss.driver.api.core.MappedAsyncPagingIterable
import com.datastax.oss.driver.api.mapper.annotations.Dao
import com.datastax.oss.driver.api.mapper.annotations.Query
import com.datastax.oss.driver.api.mapper.annotations.Select
import data.bean.Classifier
import java.util.UUID
import java.util.concurrent.CompletableFuture

/**
 * @author lauritzrasbach
 * @since 06.11.2023
 */
@Dao
interface ClassifierDao : BaseDao<Classifier> {

    /**
     * Get classifier with id
     */
    @Select
    fun get(id: UUID): CompletableFuture<Classifier?>

    /**
     * Get all classifiers
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.classifier"
    )
    fun getAllClassifiers(): CompletableFuture<MappedAsyncPagingIterable<Classifier?>>
}
