package data.dao

import com.datastax.oss.driver.api.core.cql.BoundStatementBuilder
import com.datastax.oss.driver.api.mapper.annotations.Delete
import com.datastax.oss.driver.api.mapper.annotations.Insert
import com.datastax.oss.driver.api.mapper.annotations.SetEntity
import com.datastax.oss.driver.api.mapper.annotations.Update
import java.util.concurrent.CompletableFuture

/**
 * @author Leon Camus
 * @since 03.04.2020
 */
interface BaseDao<T : Any> {
    /**
     * Insert bean into table
     */
    @Insert(ifNotExists = true)
    fun insert(bean: T): CompletableFuture<Boolean>

    /**
     * Insert or update bean in table
     */
    @Update
    fun update(bean: T): CompletableFuture<Boolean>

    /**
     * Delete bean from table
     */
    @Delete(ifExists = true)
    fun delete(bean: T): CompletableFuture<Boolean>

    /**
     * Bind bean to builder
     */
    @SetEntity
    fun bind(bean: T, builder: BoundStatementBuilder?)
}
