package backend.exchange

/* ktlint-disable custom:no-generic-catch */

import com.google.inject.Inject
import core.config.Args
import core.security.PasswordHasher
import data.bean.Applicant
import data.bean.Application
import data.bean.QSScore
import data.bean.User
import data.dao.ApplicantDao
import data.dao.ApplicationDao
import data.dao.ExamDao
import data.dao.QSScoreDao
import data.dao.StudyRegulationDao
import data.dao.UserDao
import data.dto.core.HEARTBEAT_INTERVAL
import data.dto.core.HeartbeatMessage
import data.dto.core.UploadMessage
import data.dto.core.UploadMessageStatus
import data.dto.core.timed
import io.javalin.http.BadRequestResponse
import io.javalin.http.Context
import io.javalin.http.NotFoundResponse
import io.javalin.http.formParamAsClass
import io.javalin.http.pathParamAsClass
import io.javalin.openapi.HttpMethod
import io.javalin.openapi.OpenApi
import io.javalin.openapi.OpenApiContent
import io.javalin.openapi.OpenApiParam
import io.javalin.openapi.OpenApiRequestBody
import io.javalin.openapi.OpenApiResponse
import io.javalin.websocket.WsConfig
import io.javalin.websocket.WsContext
import java.io.File
import java.time.Instant
import java.util.UUID
import java.util.UUID.randomUUID
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.apache.poi.ss.usermodel.WorkbookFactory
import util.Chunking
import util.IdentityManager
import util.all

/**
 * @author Frank Nelles
 * @since 22.07.2020
 */
class ExchangeController @Inject constructor(
    private val args: Args,
    private val applicationDao: ApplicationDao,
    private val applicantDao: ApplicantDao,
    private val examDao: ExamDao,
    private val userDao: UserDao,
    private val studyRegulationDao: StudyRegulationDao,
    private val qsScoreDao: QSScoreDao,
    private val identityManager: IdentityManager,
    private val passwordHasher: PasswordHasher
) {
    @OpenApi(
        path = "/backend/exchange/{examId}/single-file-upload/{filename}",
        methods = [HttpMethod.POST],
        summary = "Upload single (small) file",
        tags = ["exchange"],
        pathParams = [
            OpenApiParam(
                "webSocketId",
                description = "The webSocketId",
                type = UUID::class
            ),
            OpenApiParam(
                "filename",
                description = "Filename",
                type = String::class
            )
        ],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(ByteArray::class)],
            description = "File to upload",
            required = true
        ),
        responses = [
            OpenApiResponse("200", content = [OpenApiContent(String::class, type = "text/plain")]),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    @Suppress("ComplexMethod")
    fun uploadSingleFile(ctx: Context) {
        println("uploadSingleFile")
        // to know which Uploadfield was used
        val webSocketId = ctx.pathParamAsClass<UUID>("webSocketId").allowNullable().get()
            ?: throw BadRequestResponse()
        val filename = ctx.pathParamAsClass<String>("filename").get()
        val file = ctx.uploadedFile("file")
        if (file != null) {
            try {
                // if uploadField for Applications ( BUZ-Report ) was used
                if (webSocketId == UUID.fromString("07ee5965-01d8-4d4f-8f0c-50427337d7da")) {
                    println("inApplicationsIf")
                    val inputStream = file.content()
                    // Workbook to handle excel files
                    val xlWb = WorkbookFactory.create(inputStream)
                    val xlWs = xlWb.getSheetAt(0)

                    // i = 2 since first Row and second Row can be skipped in BUZ-Report
                    var i = 2
                    // Repeat as long as we have valid data
                    while (xlWs.getRow(i).getCell(0).toString() != "" || xlWs.getRow(i).getCell(0) == null) {
                        println("inApplicationsWhile")
                        // studyRegulation is always in 5th column in BUZ Report
                        val studyRegulation = this.studyRegulationDao.getRegulationWithName(
                            xlWs.getRow(i).getCell(4).toString()
                        ).get() ?: throw NotFoundResponse()
                        println(studyRegulation.name)
                        // create Application based on BUZ Report
                        val applicationToAdd = Application(
                            admissionsOffice = xlWs.getRow(i).getCell(0).toString(),
                            applicationNumber = xlWs.getRow(i).getCell(1).toString().split(".")[0],
                            method = xlWs.getRow(i).getCell(3).toString(),
                            appliedFor = studyRegulation.studyRegulationId,
                            appliedForName = studyRegulation.name,
                            lastName = xlWs.getRow(i).getCell(11).toString(),
                            firstName = xlWs.getRow(i).getCell(12).toString(),
                            mail = xlWs.getRow(i).getCell(28).toString().lowercase(),
                            alreadyApplied = false,
                            semester = "2023 WiSe",
                            applicantId = randomUUID(),
                            exam = null,
                            examIndex = null,
                            status = "inProgress",
                            city = xlWs.getRow(i).getCell(30).toString(),
                            country = xlWs.getRow(i).getCell(29).toString(),
                            street = xlWs.getRow(i).getCell(31).toString(),
                            department = studyRegulation.department,
                            inUse = true,
                            university = null
                        )
                        println("afterApplication")
                        // check if there is an existing applicant already (1. mail 2. firstName, lastName, street)
                        val foundApplicant = identityManager.findExistingApplicant(
                            applicationToAdd.mail, applicationToAdd.firstName, applicationToAdd.lastName,
                            applicationToAdd.street
                        )
                        // if there is no applicant
                        if (foundApplicant == null) {
                            // create new User
                            val password = this.passwordHasher.createRandomPassword()
                            val userToAdd = User(
                                department = applicationToAdd.department,
                                firstName = applicationToAdd.firstName,
                                lastName = applicationToAdd.lastName,
                                mail = applicationToAdd.mail,
                                password = this.passwordHasher.hash(password),
                                userId = applicationToAdd.applicantId,
                                userType = "Applicant",
                                username = applicationToAdd.mail
                            )
                            val tmp = mutableListOf<String>()
                            tmp.add(applicationToAdd.applicationNumber)
                            // create new Applicant
                            val applicantToAdd = Applicant(
                                applicantId = applicationToAdd.applicantId,
                                birthOfDate = null,
                                applications = tmp,
                                city = applicationToAdd.city,
                                country = applicationToAdd.country,
                                degree = null,
                                firstName = applicationToAdd.firstName,
                                gender = xlWs.getRow(i).getCell(9).toString(),
                                lastName = applicationToAdd.lastName,
                                mail = applicationToAdd.mail,
                                nationality = null,
                                salutation = xlWs.getRow(i).getCell(10).toString(),
                                street = applicationToAdd.street,
                                university = ""
                            )
                            // insert created Application user and Applicant into Database
                            this.applicantDao.insert(applicantToAdd)
                            this.applicationDao.insert(applicationToAdd)
                            this.userDao.insert(userToAdd)

                            /*val email = createPreconfiguredEmail()
                            email.subject = "Account Creation"
                            email.setMsg(
                                "Ihr Account wurde erfolgreich erstellt. Sie können sich mit ihrer E-Mail " +
                                    "und dem Paswsort: " + password + " anmelden"
                            )
                            email.addTo(userToAdd.mail)

                            email.send()*/

                            // if Applicant exists already
                        } else {
                            println("ApplicantFound")
                            // give Application his ID
                            applicationToAdd.applicantId = foundApplicant.applicantId
                            // If Applicant has this Application already skip otherwise add it to his applications
                            if (!foundApplicant.applications.contains(applicationToAdd.applicationNumber)) {
                                foundApplicant.applications.add(applicationToAdd.applicationNumber)
                                foundApplicant.street = applicationToAdd.street
                                foundApplicant.university = applicationToAdd.university
                                foundApplicant.lastName = applicationToAdd.lastName
                                foundApplicant.firstName = applicationToAdd.firstName
                                foundApplicant.mail = applicationToAdd.mail
                                // insert created Application and update Applicant
                                this.applicationDao.insert(applicationToAdd)
                                this.applicantDao.update(foundApplicant)
                            }
                        }
                        // do next Row
                        i++
                    }
                    sendMessage(webSocketId, UploadMessage(UploadMessageStatus.SUCCESS, ""))
                    // if Exam Uploadfield was used
                    // TODO: finish proprely when test data is here
                } else if (webSocketId == UUID.fromString("e905d2a7-94d8-4fdb-9a8b-7b9e32ea6d3d")) {
                    val inputStream = file.content()
                    // Workbook to handle excel files
                    val xlWb = WorkbookFactory.create(inputStream)
                    val xlWs = xlWb.getSheetAt(0)

                    // i = 2 since first Row and second Row can be skipped in QS Score
                    var i = 2

                    println(xlWs.lastRowNum)
                    while (i <xlWs.lastRowNum) {
                        // println("inQSScoreWhile")
                        println(xlWs.getRow(i).getCell(0).toString())

                        val scoreToAdd = QSScore(
                            id = randomUUID(),
                            rank = 0,
                            score = if (xlWs.getRow(i).getCell(26).toString().toFloatOrNull() == null) 0F else xlWs.getRow(i).getCell(26).toString().toFloat(),
                            university = xlWs.getRow(i).getCell(2).toString()
                        )

                        this.qsScoreDao.insert(scoreToAdd)

                        // do next Row
                        i++
                    }

                    sendMessage(webSocketId, UploadMessage(UploadMessageStatus.SUCCESS, ""))
                } else {
                    // accepted boolean whether admin was satisfied with stats or not
                    val accepted: Boolean = ctx.formParam("accepted").toBoolean()
                    // threshold to pass exam
                    val threshold: Double = ((ctx.formParam("threshold")!!.toDouble()) / 100)
                    println(threshold)
                    // values if you upload exam data, value[0] is always exam.id, rest has form condition.name:1-4
                    val values = ctx.formParams("keyArray")
                    val inputStream = file.content()
                    val reader = inputStream.bufferedReader()
                    var examAmount = 0
                    var passedAmount = 0
                    var notPassedAmount = 0
                    val applicationsToUpdate = mutableListOf<Application>()
                    // i = 1 since first Row is header Row and can be skipped
                    // values[0] contains exam.id, so we know which exam is uploaded
                    val exam = this.examDao.get(UUID.fromString(values[0])).get() ?: throw NotFoundResponse()
                    val studyRegulation = this.studyRegulationDao.get(exam.studyRegulationId).get()
                    // conditions contains condition.name
                    val conditions = mutableListOf<String>()
                    // tasks contains the range of tasks e.g 1-4
                    val tasks = mutableListOf<String>()
                    // values[1] - values[size-1] contain all conditions + their range, values[1] = condition.name:1-4
                    for (j in 1 until values.size) {
                        val tmp = values[j].split(":")
                        println(tmp)
                        conditions.add(tmp[0])
                        tasks.add(tmp[1])
                    }
                    val header = reader.readLine().split(";")
                    // while we have valid data repeat
                    reader.forEachLine { line ->
                        val currentLine = line.split(";")
                        if (currentLine[0] != "Gesamtdurchschnitt") {
                            // E-Mail always in third column so we can use it to get the Applicant
                            val applicant = this.applicantDao.getWithMail(
                                currentLine[2].lowercase()
                            ).get() ?: throw NotFoundResponse()
                            // Get all Applications the Applicant has applied for
                            var applications =
                                this.applicationDao.getApplicationsFromApplicantId(applicant.applicantId).get().all()
                                    .get()
                            // Get all Applications of the Applicant that match provided exam and in which
                            // he got invited to an Exam TODO: add semester since possible to apply for next 2 Semester
                            applications = applications.filter { application ->
                                application?.status == "invitedToExam" &&
                                    application.exam == exam.examId &&
                                    application.semester == exam.semester
                            }
                            // the first 8 columns are not task Fields, so we start at 8 to handle taskData
                            val taskStart = 8
                            val newConditions = mutableListOf<String>()
                            val newCp = mutableListOf<String>()
                            var currentCp = 0
                            // Do for every condition
                            for (j in 0 until conditions.size) {
                                // Since we use 1-4 for range we need to split with "-"
                                val taskSplit = tasks[j].split("-")
                                // the offset to get starting index of this condition
                                val offset = taskSplit[0].toInt() - 1
                                // how many tasks we have for this condition
                                val length = taskSplit[1].toInt() - taskSplit[0].toInt()
                                var maxPoints = 0.0
                                var reachedPoints = 0.0
                                // Do for every task
                                for (k in taskStart + offset..taskStart + offset + length) {
                                    // Convert "1,06" to perform arithmetic operations
                                    maxPoints += header[k].split("/")[1].replace(",", ".").toDouble()
                                    println(maxPoints)
                                    // Current Row points and convert to Double to perform arithmetic operations
                                    reachedPoints += currentLine[k].replace(",", ".").toDouble()
                                    println(reachedPoints)
                                }
                                // if applicant didnt get enough points
                                if (reachedPoints / maxPoints < threshold) {
                                    println(maxPoints / reachedPoints)
                                    // add condition and Cp to application
                                    newConditions.add(conditions[j])
                                    val conditionCp =
                                        studyRegulation!!.creditPoints[
                                            studyRegulation.conditions.indexOf(conditions[j])
                                        ]
                                    newCp.add(conditionCp)
                                    currentCp += conditionCp.split("C")[0].toInt()
                                }
                            }
                            examAmount++
                            val newStatus: String = if (studyRegulation!!.maxCp.toInt() < currentCp) {
                                notPassedAmount++
                                "invitedToExamDenied"
                            } else {
                                passedAmount++
                                "invitedToExamAccepted"
                            }
                            applications.forEach { application ->
                                application?.conditions = newConditions
                                application?.cp = newCp
                                application?.status = newStatus
                                applicationsToUpdate.add(application!!)
                            }
                        }
                    }
                    // if the uploader is satisfied with the exam stats*/
                    if (accepted) {
                        applicationsToUpdate.forEach { application ->
                            this.applicationDao.update(application)
                        }
                        sendMessage(webSocketId, UploadMessage(UploadMessageStatus.SUCCESS, ""))
                        // if the uploader wasnt satisfied with the exam stats create new stats with new threshold
                    } else {
                        ctx.result(
                            examAmount.toString() + ":" + passedAmount.toString() +
                                ":" + notPassedAmount.toString()
                        )
                    }
                }
            } catch (e: Exception) {
                // TODO: Implement roll-back in case of error
                System.gc()
                sendMessage(webSocketId, UploadMessage(UploadMessageStatus.ERROR, ""))
                throw e
            }
        }
    }

    @OpenApi(
        path = "/backend/exchange/{examId}/upload",
        methods = [HttpMethod.POST],
        summary = "Upload files",
        tags = ["exchange"],
        pathParams = [
            OpenApiParam(
                "webSocketId",
                description = "The exam id to upload to",
                type = UUID::class
            )
        ],
        requestBody = OpenApiRequestBody(
            content = [OpenApiContent(ByteArray::class)],
            description = "The request body has to contain the actual file chunk and meta-data: filename, timestamp " +
                "(generated once per upload; not per chunk), number of chunks in total and the current chunk number",
            required = true
        ),
        responses = [
            OpenApiResponse("200"),
            OpenApiResponse("400"),
            OpenApiResponse("403")
        ]
    )
    @Suppress("ComplexMethod", "UnusedPrivateMember") // TODO: Remove "UnusedPrivateMember"
    fun uploadWithWebSocketId(ctx: Context) {
        val webSocketId = ctx.pathParamAsClass<UUID>("webSocketId").allowNullable().get()
            ?: throw BadRequestResponse()

        val file = ctx.uploadedFile("file")
        val filename = ctx.formParamAsClass<String>("filename").get()
        val timestamp = ctx.formParamAsClass<Long>("timestamp").get()
        val last = ctx.formParamAsClass<Boolean>("last").get()
        val chunk = ctx.formParamAsClass<Int>("chunk").get()
        val totalChunks = ctx.formParamAsClass<Int>("totalChunks").get()

        val uploadTime = Instant.now()

        if (file != null) {
            val path = "${args.storageDir}/$webSocketId/upload-$timestamp"

            Chunking.streamToFileChunk(file.content(), path, filename, chunk)

            if (Chunking.checkReady(totalChunks, path, filename)) {
                GlobalScope.launch {
                    try {
                        val chunking = Chunking(totalChunks, path, filename, webSocketId, sendMessage)
                        val targetFile = chunking.putTogether()

                        // targetFile contains your file.
                        // filename contains the file name.
                        // TODO: Implement your file flow.

                        sendMessage(
                            webSocketId,
                            UploadMessage(
                                UploadMessageStatus.SUCCESS,
                                "Import process successfully finished for file '$filename'."
                            )
                        )

                        if (last) {
                            sendMessage(webSocketId, UploadMessage(UploadMessageStatus.SUCCESS, ""))
                            sendMessage(
                                webSocketId,
                                UploadMessage(UploadMessageStatus.SUCCESS, "All files where uploaded successfully.")
                            )
                            sendMessage(webSocketId, UploadMessage(UploadMessageStatus.SUCCESS, ""))
                        }

                        System.gc()
                        File(path).deleteRecursively()
                        if (last) sendMessage(
                            webSocketId,
                            UploadMessage(UploadMessageStatus.SUCCESS, "The upload process terminated.")
                        )
                    } catch (e: Exception) {
                        sendMessage(webSocketId, UploadMessage(UploadMessageStatus.ERROR, ""))
                        sendMessage(
                            webSocketId,
                            UploadMessage(
                                UploadMessageStatus.ERROR,
                                "An error occurred while importing file '$filename'. Import of this file aborted."
                            )
                        )
                        sendMessage(webSocketId, UploadMessage(UploadMessageStatus.ERROR, ""))

                        // TODO: Implement roll-back in case of error

                        sendMessage(
                            webSocketId,
                            UploadMessage(
                                UploadMessageStatus.WARNING,
                                "Partially imported data and files are deleted."
                            )
                        )
                        sendMessage(
                            webSocketId,
                            UploadMessage(UploadMessageStatus.WARNING, "Try again or contact support.")
                        )
                        sendMessage(
                            webSocketId,
                            UploadMessage(
                                UploadMessageStatus.WARNING,
                                "Support data: WebSocketID: $webSocketId, " +
                                    "Upload time: $uploadTime / ${uploadTime.toEpochMilli()}"
                            )
                        )
                        println(
                            "IMPORT_FAILED: Support data: WebSocketID: $webSocketId, " +
                                "Upload time: $uploadTime / ${uploadTime.toEpochMilli()}"
                        )

                        System.gc()
                        File(path).deleteRecursively()
                        sendMessage(
                            webSocketId,
                            UploadMessage(UploadMessageStatus.ERROR, "The upload process terminated.")
                        )

                        throw e
                    }
                }
            }
        }
    }

    private val clients = mutableMapOf<UUID, MutableList<WsContext>>()

    /**
     * Check whether user has right to upload -> therefore right to access the websocket
     */
//    private fun checkUploadRights(ctx: WsContext): Boolean {
//        val webSocketId = ctx.pathParamAsClass<UUID>("webSocketId").get()
//
//        return ctx.isAdmin()
//    }

    /**
     * Create and handle websocket connection for upload messages
     */
    fun uploadMessagesWebSocket(ws: WsConfig) {
        timed(HEARTBEAT_INTERVAL) {
            sendHeartbeat()
        }

        ws.onConnect { ctx ->
            val webSocketId = ctx.pathParamAsClass<UUID>("webSocketId").get()

            clients.putIfAbsent(webSocketId, mutableListOf())
            clients[webSocketId]?.add(ctx)
        }
        ws.onMessage { ctx ->
        }
        ws.onClose { ctx ->
            clients[ctx.pathParamAsClass<UUID>("webSocketId").get()]?.remove(ctx)
        }
    }

    // Send message to all clients
    private val sendMessage: (webSocketId: UUID, wsMsg: UploadMessage) -> Unit = { webSocketId, wsMsg ->
        clients[webSocketId]?.forEach { ctx ->
            ctx.send(wsMsg)
        }
    }

    /**
     * Send heartbeat message to all clients
     */
    private fun sendHeartbeat() {
        clients.forEach { (_, connectionList) ->
            connectionList.forEach { connection ->
                connection.send(HeartbeatMessage())
            }
        }
    }

    /**
     * get a preconfigured email object.
     * This function and the properties set in it should not be changed!
     */
//    private fun createPreconfiguredEmail(): SimpleEmail {
//        val email = SimpleEmail()
//        email.hostName = args.mailSmtpHost
//        email.isStartTLSEnabled = args.mailSmtpStartTls
//        if (args.mailSmtpTls) {
//            email.sslSmtpPort = args.mailSmtpPort.toString()
//            email.isSSLOnConnect = args.mailSmtpTls
//        } else {
//            email.setSmtpPort(args.mailSmtpPort!!)
//        }
//        if (args.mailSmtpUsername != null && args.mailSmtpPassword != null) {
//            email.setAuthenticator(DefaultAuthenticator(args.mailSmtpUsername, args.mailSmtpPassword))
//        }
//        email.setFrom(args.mailSmtpSender)
//
//        return email
//    }
}
