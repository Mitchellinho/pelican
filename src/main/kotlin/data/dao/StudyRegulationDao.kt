package data.dao

import com.datastax.oss.driver.api.core.MappedAsyncPagingIterable
import com.datastax.oss.driver.api.mapper.annotations.Dao
import com.datastax.oss.driver.api.mapper.annotations.Query
import com.datastax.oss.driver.api.mapper.annotations.Select
import data.bean.StudyRegulation
import java.util.UUID
import java.util.concurrent.CompletableFuture

/**
 * @author Michael Gense
 * @since 23.08.2022
 */
@Dao
interface StudyRegulationDao : BaseDao<StudyRegulation> {
    /**
     * Get StudyRegulation with given Id
     */
    @Select
    fun get(studyRegulationId: UUID): CompletableFuture<StudyRegulation?>

    /**
     * Get StudyRegulation with degreename and department
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.study_regulation " +
            "WHERE name = :name AND department = :department ALLOW FILTERING"
    )
    fun getWithNameAndDepartment(name: String, department: String): CompletableFuture<StudyRegulation?>

    /**
     * Get all StudyRegulations
     */
    @Query("SELECT * FROM \${keyspaceId}.study_regulation")
    fun getAllRegulations(): CompletableFuture<MappedAsyncPagingIterable<StudyRegulation?>>

    /**
     * Get StudyRegulations with given department
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.study_regulation " +
            "WHERE department = :department ALLOW FILTERING"
    )
    fun getRegulationsWithDepartment(department: String): CompletableFuture<MappedAsyncPagingIterable<StudyRegulation?>>

    /**
     * Get StudyRegulations with given department
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.study_regulation " +
            "WHERE name = :name ALLOW FILTERING"
    )
    fun getRegulationWithName(name: String): CompletableFuture<StudyRegulation?>
}
