package data.dao

import com.datastax.oss.driver.api.core.MappedAsyncPagingIterable
import com.datastax.oss.driver.api.mapper.annotations.Dao
import com.datastax.oss.driver.api.mapper.annotations.Query
import com.datastax.oss.driver.api.mapper.annotations.Select
import data.bean.Exam
import java.util.UUID
import java.util.concurrent.CompletableFuture

/**
 * @author Michael
 * @since 21.09.2022
 */
@Dao
interface ExamDao : BaseDao<Exam> {

    /**
     * Get user
     */
    @Select
    fun get(exam_id: UUID): CompletableFuture<Exam?>

    /**
     * Get all Exam
     */
    @Query("SELECT * FROM \${keyspaceId}.exam")
    fun getAllExams(): CompletableFuture<MappedAsyncPagingIterable<Exam?>>

    /**
     * Get all Exams with a certain department
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.exam " +
            "WHERE department = :department ALLOW FILTERING"
    )
    fun getAllExamsWithDepartment(department: String): CompletableFuture<MappedAsyncPagingIterable<Exam?>>
}
