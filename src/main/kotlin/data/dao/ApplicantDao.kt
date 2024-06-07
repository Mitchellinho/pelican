package data.dao

import com.datastax.oss.driver.api.mapper.annotations.Dao
import com.datastax.oss.driver.api.mapper.annotations.Query
import com.datastax.oss.driver.api.mapper.annotations.Select
import data.bean.Applicant
import java.util.UUID
import java.util.concurrent.CompletableFuture

/**
 * @author Michael
 * @since 28.09.2022
 */
@Dao
interface ApplicantDao : BaseDao<Applicant> {

    /**
     * Get applicant with applicantID
     */
    @Select
    fun get(applicant_id: UUID): CompletableFuture<Applicant?>

    /**
     * Get Applicant with E-Mail
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.applicant " +
            "WHERE mail = :mail ALLOW FILTERING"
    )
    fun getWithMail(mail: String): CompletableFuture<Applicant?>

    /**
     * Get Applicant with lastName, firstName, street
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.applicant " +
            "WHERE last_name = :last_name AND first_name = :first_name AND street = :street ALLOW FILTERING"
    )
    fun getWithNameAndStreet(last_name: String, first_name: String, street: String):
        CompletableFuture<Applicant?>
}
