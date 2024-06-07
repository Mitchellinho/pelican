package util

import com.datastax.oss.driver.api.core.MappedAsyncPagingIterable
import java.util.concurrent.CompletableFuture

/**
 * Iterate through all pages and store results in a list.
 */
fun <T> MappedAsyncPagingIterable<T>.all(): CompletableFuture<List<T>> {
    /**
     * Recursive helper.
     */
    fun fetcher(
        page: CompletableFuture<MappedAsyncPagingIterable<T>>,
        pages: MutableList<T> =
            mutableListOf()
    ): CompletableFuture<MutableList<T>> = page.flatMap {
        pages.addAll(it.currentPage())
        if (it.hasMorePages()) {
            fetcher(it.fetchNextPage().toCompletableFuture(), pages)
        } else {
            CompletableFuture.completedFuture(pages)
        }
    }

    return fetcher(CompletableFuture.completedFuture(this)).map { list: List<T> -> list }
}
