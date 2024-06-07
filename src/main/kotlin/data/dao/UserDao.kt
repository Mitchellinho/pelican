package data.dao

import com.datastax.oss.driver.api.core.MappedAsyncPagingIterable
import com.datastax.oss.driver.api.mapper.annotations.Dao
import com.datastax.oss.driver.api.mapper.annotations.Query
import com.datastax.oss.driver.api.mapper.annotations.Select
import data.bean.User
import java.util.UUID
import java.util.concurrent.CompletableFuture

/**
 * @author Frank Nelles
 * @since 13.06.2020
 */
@Dao
interface UserDao : BaseDao<User> {
    /**
     * Get user with id
     */
    @Select
    fun get(user_id: UUID): CompletableFuture<User?>

    /**
     * Get user with password and username
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.user " +
            "WHERE username = :username ALLOW FILTERING"
    )
    fun getWithUsername(username: String): CompletableFuture<User?>

    /**
     * Get user with password and EMail
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.user " +
            "WHERE mail = :mail ALLOW FILTERING"
    )
    fun getWithEmail(mail: String): CompletableFuture<User?>

    /**
     *
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.user"
    )
    fun getAllUsers(): CompletableFuture<MappedAsyncPagingIterable<User?>>

    /**
     * Get All Users with given department
     */
    @Query(
        "SELECT * FROM \${keyspaceId}.user " +
            "WHERE department = :department ALLOW FILTERING"
    )
    fun getAllUsersWithDepartment(department: String): CompletableFuture<MappedAsyncPagingIterable<User?>>

    /**
     * Get all Users selected by userType
     */
    @Query("SELECT * FROM \${keyspaceId}.user WHERE user_type = :user_type ALLOW FILTERING")
    fun getAllWithType(user_type: String): CompletableFuture<MappedAsyncPagingIterable<User?>>
}
