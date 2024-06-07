package data.dao

import com.datastax.oss.driver.api.core.MappedAsyncPagingIterable
import com.datastax.oss.driver.api.mapper.annotations.Dao
import com.datastax.oss.driver.api.mapper.annotations.Query
import com.datastax.oss.driver.api.mapper.annotations.Select
import data.bean.Rule
import java.util.UUID
import java.util.concurrent.CompletableFuture

/**
 * @author Michael Gense
 * @since 23.08.2022
 */
@Dao
interface RuleDao : BaseDao<Rule> {
    /**
     * Get rule with id
     */
    @Select
    fun get(rule_id: UUID): CompletableFuture<Rule?>

    /**
     * Get all rules
     */
    @Query("SELECT * FROM \${keyspaceId}.rule")
    fun getAllRules(): CompletableFuture<MappedAsyncPagingIterable<Rule?>>

    /**
     * Get all rules with department
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.rule " +
            "WHERE department = :department ALLOW FILTERING"
    )
    fun getAllRulesWithDepartment(department: String): CompletableFuture<MappedAsyncPagingIterable<Rule?>>
}
