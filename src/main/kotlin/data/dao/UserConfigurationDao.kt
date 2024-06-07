package data.dao

import com.datastax.oss.driver.api.mapper.annotations.Dao
import com.datastax.oss.driver.api.mapper.annotations.Select
import data.bean.UserConfiguration
import java.util.UUID
import java.util.concurrent.CompletableFuture

/**
 * @author Frank Nelles
 * @since 10.01.2022
 */
@Dao
interface UserConfigurationDao : BaseDao<UserConfiguration> {
    /**
     * Get user
     */
    @Select
    fun get(user_id: UUID): CompletableFuture<UserConfiguration?>
}
