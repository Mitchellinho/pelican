package core.cleanup

import core.config.Args
import java.io.File
import java.time.Instant
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

const val UPLOAD_DELETION = 1000L * 60 * 60 * 24 * 2
const val LOOP = 1000L * 60 * 60 * 24

/**
 * Deletes upload-{timestamp} directories after certain period of time (above)
 * @author Frank Nelles
 * @since 23.11.2020
 */
object CleanUpCoroutine {
    /**
     * Start coroutine - Executes every 24 hours
     */
    @Suppress("ComplexMethod")
    fun start(args: Args) {
        GlobalScope.launch {
            while (true) {
                System.gc()
                File(args.storageDir).listFiles()?.forEach { mainDir ->
                    if (mainDir.isDirectory) {
                        mainDir.listFiles()?.forEach { subDir ->
                            val filename = subDir.nameWithoutExtension

                            if (subDir.isDirectory && filename.startsWith("upload-")) {
                                delete(subDir, UPLOAD_DELETION)
                            }
                        }
                    }
                }

                delay(LOOP)
            }
        }
    }

    /**
     * Delete file/dir if its time is exceeded
     */
    private fun delete(f: File, deletionTime: Long, fileTime: Instant? = null) {
        val time = if (fileTime == null) {
            val filenameTime = f.nameWithoutExtension.split("-")[1].toLong()
            Instant.ofEpochMilli(filenameTime)
        } else {
            fileTime
        }

        if (time.isBefore(Instant.now().minusMillis(deletionTime))) {
            f.deleteRecursively()
        }
    }
}
