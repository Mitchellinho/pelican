package data.dao

import com.datastax.oss.driver.api.core.MappedAsyncPagingIterable
import com.datastax.oss.driver.api.mapper.annotations.Dao
import com.datastax.oss.driver.api.mapper.annotations.Query
import com.datastax.oss.driver.api.mapper.annotations.Select
import data.bean.Application
import java.util.UUID
import java.util.concurrent.CompletableFuture

/**
 * @author Michael Gense
 * @since 23.08.2022
 */
@Dao
interface ApplicationDao : BaseDao<Application> {
    /**
     * Get application with applicationNumber
     */
    @Select
    fun get(application_number: String): CompletableFuture<Application?>

    /**
     * Get all applications from a certain User with his ID
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.application " +
            "WHERE applicant_id = :applicant_id ALLOW FILTERING"
    )
    fun getApplicationsFromApplicantId(applicant_id: UUID): CompletableFuture<MappedAsyncPagingIterable<Application?>>

    /**
     * Get all Applications
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.application"
    )
    fun getAllApplications(): CompletableFuture<MappedAsyncPagingIterable<Application?>>

    /**
     * Get all Applications with given department
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.application " +
            "WHERE department = :department ALLOW FILTERING"
    )
    fun getAllApplicationsWithDepartment(department: String): CompletableFuture<MappedAsyncPagingIterable<Application?>>

    /**
     * Get all Applications with given Semester
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.application " +
            "WHERE semester = :semester ALLOW FILTERING"
    )
    fun getApplicationsWithSemester(semester: String): CompletableFuture<MappedAsyncPagingIterable<Application?>>

    /**
     * Get all Applications with given Semester and department
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.application " +
            "WHERE semester = :semester AND department = :department ALLOW FILTERING"
    )
    fun getApplicationsWithSemesterAndDepartment(
        semester: String,
        department: String
    ): CompletableFuture<MappedAsyncPagingIterable<Application?>>
}
