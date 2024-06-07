package data.dao

import com.datastax.oss.driver.api.core.MappedAsyncPagingIterable
import com.datastax.oss.driver.api.mapper.annotations.Dao
import com.datastax.oss.driver.api.mapper.annotations.Query
import com.datastax.oss.driver.api.mapper.annotations.Select
import data.bean.ExamLocation
import java.util.UUID
import java.util.concurrent.CompletableFuture

/**
 * @author Michael
 * @since 21.09.2022
 */
@Dao
interface ExamLocationDao : BaseDao<ExamLocation> {

    /**
     * Get user
     */
    @Select
    fun get(exam_location_id: UUID): CompletableFuture<ExamLocation?>

    /**
     * Get all ExamLocations
     */
    @Query("SELECT * FROM \${keyspaceId}.exam_location")
    fun getAllExamLocations(): CompletableFuture<MappedAsyncPagingIterable<ExamLocation?>>

    /**
     * Get all ExamLocations with a certain department
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.exam_location " +
            "WHERE department = :department ALLOW FILTERING"
    )
    fun getAllExamLocationsWithDepartment(department: String):
        CompletableFuture<MappedAsyncPagingIterable<ExamLocation?>>
}
