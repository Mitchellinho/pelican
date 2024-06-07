package data.dto.core

import java.util.Timer
import java.util.TimerTask

/**
 * Time
 */
fun timed(period: Long, runnable: () -> Unit): Timer {
    val timer = Timer()
    timer.schedule(
        object : TimerTask() {
            /**
             * Let the timer execute the provided function.
             */
            override fun run() {
                runnable()
            }
        },
        0,
        period
    )
    return timer
}
