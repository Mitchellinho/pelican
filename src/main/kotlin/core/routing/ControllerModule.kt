package core.routing

import dev.misfitlabs.kotlinguice4.KotlinModule
import dev.misfitlabs.kotlinguice4.multibindings.KotlinMultibinder
import io.javalin.apibuilder.ApiBuilder.get

/**
 * @author Leon Camus
 * @since 05.02.2020
 */
abstract class ControllerModule : KotlinModule() {
    /**
     * Create a route, later injected into Javalin.
     */
    protected inline fun <reified C : Any> route(crossinline router: (C) -> Unit) {
        KotlinMultibinder.newSetBinder<Routing<*>>(binder())
            .addBinding()
            .toInstance(object : Routing<C>(C::class) {
                override fun route(controller: C): Unit = router(controller)
            })
    }
}
