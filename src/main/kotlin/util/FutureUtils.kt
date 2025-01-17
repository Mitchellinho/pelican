package util

import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executor
import java.util.concurrent.TimeUnit
import java.util.function.BiConsumer
import java.util.function.Function

/* ktlint-disable custom:document-fun */

object FP {
    fun <A> successful(a: A): CompletableFuture<A> = CompletableFuture<A>().also { it.complete(a) }
    fun <A> failed(t: Throwable): CompletableFuture<A> = CompletableFuture<A>().failed(t)
}

fun <A> CompletableFuture<A>.success(a: A): CompletableFuture<A> = this.also { it.complete(a) }
fun <A> CompletableFuture<A>.failed(e: Throwable): CompletableFuture<A> = this.also { it.completeExceptionally(e) }
fun <A> CompletableFuture<A>.tryFailure(e: Throwable): Boolean = this.completeExceptionally(e)

fun <A> Try<A>.asCompletedFuture(): CompletableFuture<A> = when (this) {
    is Success -> FP.successful(this.value)
    is Failure -> FP.failed(this.exception)
}

fun <A> CompletableFuture<A>.getAsTry(millis: Long, unit: TimeUnit): Try<A> = Try { get(millis, unit) }

inline fun <A, B> CompletableFuture<A>.mapTry(crossinline f: (A, Throwable?) -> B): CompletableFuture<B> =
    handle { a, t: Throwable? -> f(a, t) }

inline fun <A, B> CompletableFuture<A>.flatMapTry(crossinline f: (A, Throwable?) -> CompletableFuture<B>):
    CompletableFuture<B> = this.mapTry(f).flatten()

@Suppress("IMPLICIT_CAST_TO_ANY")
fun <A> CompletableFuture<CompletableFuture<A>>.flatten(): CompletableFuture<A> {
    val future = CompletableFuture<A>()
    this.mapTry { completableFuture, throwable ->
        if (throwable == null) {
            completableFuture.mapTry { a, throwable2 ->
                if (throwable2 == null) {
                    future.complete(a)
                } else {
                    future.completeExceptionally(throwable2)
                }
            }
        } else {
            future.completeExceptionally(throwable)
        }
    }
    return future
}

inline fun <A, B> CompletableFuture<A>.map(crossinline f: (A) -> B): CompletableFuture<B> =
    thenApply { f(it) }

inline fun <A, B> CompletableFuture<A>.mapAsync(executor: Executor, crossinline f: (A) -> B): CompletableFuture<B> =
    thenApplyAsync(Function { f(it) }, executor)

inline fun <A, B> CompletableFuture<A>.flatMapAsync(
    executor: Executor,
    crossinline f: (A) -> CompletableFuture<B>
): CompletableFuture<B> =
    thenComposeAsync(Function { f(it) }, executor)

inline fun <A, B> CompletableFuture<A>.flatMap(
    crossinline f: (A) -> CompletableFuture<B>
): CompletableFuture<B> =
    thenCompose { f(it) }

inline fun <A> CompletableFuture<A>.onFailureAsync(
    executor: Executor,
    crossinline onFailureFun: (Throwable) -> Unit
): CompletableFuture<A> =
    whenCompleteAsync(BiConsumer { _, t -> if (t != null) onFailureFun(t) }, executor)

inline fun <A> CompletableFuture<A>.onComplete(crossinline onCompleteFun: (Try<A>) -> Unit):
    CompletableFuture<A> = whenComplete { a, t -> onCompleteFun(if (t != null) Try.raise(t) else Try.just(a)) }

inline fun <A> CompletableFuture<A>.onCompleteAsync(
    executor: Executor,
    crossinline onCompleteFun: (Try<A>) -> Unit
): CompletableFuture<A> =
    whenCompleteAsync(BiConsumer { a, t -> onCompleteFun(if (t != null) Try.raise(t) else Try.just(a)) }, executor)

val <A> CompletableFuture<A>.isCompleted
    get() =
        this.isDone
val <A> CompletableFuture<A>.isSuccess: Boolean
    get() =
        this.isDone && !this.isCompletedExceptionally && !this.isCancelled
val <A> CompletableFuture<A>.isFailure: Boolean
    get() =
        this.isDone && (this.isCompletedExceptionally || this.isCancelled)

fun <A> CompletableFuture<A>.complete(t: Try<A>): Boolean = when (t) {
    is Success -> this.complete(t.value)
    is Failure -> this.completeExceptionally(t.exception)
}

@Suppress("ThrowingExceptionsWithoutMessageOrCause")
inline fun <A> CompletableFuture<A?>.orElseThrow(crossinline throwable: () -> Throwable):
    CompletableFuture<A> = flatMap {
    it?.let {
        this as CompletableFuture<A>
    } ?: CompletableFuture.failedFuture(throwable())
}

@Suppress("ThrowingExceptionsWithoutMessageOrCause")
inline fun CompletableFuture<Boolean>.ifFalseThrow(crossinline throwable: () -> Throwable):
    CompletableFuture<Unit> = flatMap {
    if (it) CompletableFuture.completedFuture(Unit) else CompletableFuture.failedFuture(throwable())
}

inline fun <A> CompletableFuture<A?>.orElse(crossinline orElse: () -> A): CompletableFuture<A> = flatMap {
    it?.let { this as CompletableFuture<A> } ?: CompletableFuture.completedFuture(orElse())
}

fun <A> List<CompletableFuture<A>>.flatten(): CompletableFuture<List<A>> =
    CompletableFuture.allOf(*this.toTypedArray()).map { this.map { it.get() } }

fun <A, B> Pair<CompletableFuture<A>, CompletableFuture<B>>.flatten(): CompletableFuture<Pair<A, B>> =
    CompletableFuture.allOf(this.first, this.second).map { this.first.get() to this.second.get() }

@Suppress("ThrowingExceptionsWithoutMessageOrCause")
inline fun <A> A?.wrap(throwable: () -> Throwable): CompletableFuture<A> =
    if (this != null) CompletableFuture.completedFuture(this) else CompletableFuture.failedFuture(throwable())
