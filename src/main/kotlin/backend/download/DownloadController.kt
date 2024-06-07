package backend.download

import com.google.inject.Inject
import core.security.helpers.getDepartment
import core.security.helpers.getUserType
import core.security.helpers.isAdmin
import data.bean.Application
import data.bean.Rule
import data.bean.StudyRegulation
import data.dao.ApplicantDao
import data.dao.ApplicationDao
import data.dao.ExamDao
import data.dao.RuleDao
import data.dao.StudyRegulationDao
import io.javalin.http.Context
import io.javalin.http.ForbiddenResponse
import io.javalin.http.NotFoundResponse
import io.javalin.http.queryParamAsClass
import io.javalin.openapi.HttpMethod
import io.javalin.openapi.OpenApi
import io.javalin.openapi.OpenApiContent
import io.javalin.openapi.OpenApiParam
import io.javalin.openapi.OpenApiResponse
import java.io.File
import java.io.FileOutputStream
import java.time.LocalDateTime
import java.util.Date
import java.util.UUID
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import org.apache.poi.ss.usermodel.WorkbookFactory
import util.IdentityManager
import util.all

/**
 * @author Michael
 * @since 19.10.2022
 */
class DownloadController @Inject constructor(
    private val applicationDao: ApplicationDao,
    private val applicantDao: ApplicantDao,
    private val studyRegulationDao: StudyRegulationDao,
    private val examDao: ExamDao,
    private val ruleDao: RuleDao,
    private val identityManager: IdentityManager
) {

    @OpenApi(
        path = "/backend/download/table",
        methods = [HttpMethod.GET],
        summary = "Get File to download",
        tags = ["download"],
        queryParams = [
            OpenApiParam(
                "finalize",
                description = "Whether to delete all applicants in this semester after exporting or not",
                required = true,
                type = Boolean::class
            )
        ],
        responses = [
            OpenApiResponse(
                "200", content = [OpenApiContent(ByteArray::class, type = "application/zip")]
            ),
            OpenApiResponse("400")
        ]
    )
    @Suppress("ComplexMethod")
    fun downloadTable(ctx: Context) {
        val finalize = ctx.queryParamAsClass<Boolean>("finalize").get()
        if (ctx.isAdmin()) {
            // create Zip Stream
            val zip = ZipOutputStream(FileOutputStream("tables.zip"))
            // get all Applications if User is Admin get all if user is editor get all with Department
            val applications: List<Application?> = if (ctx.getUserType() == "Admin") {
                this.applicationDao.getAllApplications().get().all().get()
            } else {
                this.applicationDao.getAllApplicationsWithDepartment(ctx.getDepartment()).get().all().get()
            }
            // sort them by last Name
            applications.sortedBy { application: Application? -> application?.lastName }
            // all studyRegulations
            val studyRegulations: MutableList<StudyRegulation> = mutableListOf()
            // get all StudyRegulations that are used in applications list
            applications.forEach { application ->
                val studyRegulation = this.studyRegulationDao.get(application!!.appliedFor).get()
                if (!studyRegulations.contains(studyRegulation)) {
                    studyRegulations.add(studyRegulation!!)
                }
            }
            // for every studyRegulation do this
            for (i in 0 until studyRegulations.size) {
                // create excel workbook
                val xlWb = WorkbookFactory.create(true)
                // create excel worksheet
                val xlWs = xlWb.createSheet(studyRegulations[i].name)
                // first row
                val headerRow = xlWs.createRow(0)

                // create every header
                headerRow.createCell(0).setCellValue("Vorname")
                headerRow.createCell(1).setCellValue("Nachname")
                headerRow.createCell(2).setCellValue("Zulassungsstelle")
                headerRow.createCell(3).setCellValue("Bewerbungsverfahen")
                headerRow.createCell(4).setCellValue("Bewerbungsnummer")
                headerRow.createCell(5).setCellValue("Beworben für")
                headerRow.createCell(6).setCellValue("Semester")
                headerRow.createCell(7).setCellValue("E-Mail")
                headerRow.createCell(8).setCellValue("Geschlecht")
                headerRow.createCell(9).setCellValue("Anrede")
                headerRow.createCell(10).setCellValue("Land")
                headerRow.createCell(11).setCellValue("Stadt")
                headerRow.createCell(12).setCellValue("Straße")
                headerRow.createCell(13).setCellValue("Nationalität")
                headerRow.createCell(14).setCellValue("Geburtstag")
                headerRow.createCell(15).setCellValue("Universität")
                headerRow.createCell(16).setCellValue("Abschluss")
                headerRow.createCell(17).setCellValue("Klausur?")
                headerRow.createCell(18).setCellValue("Klausurdatum")
                headerRow.createCell(19).setCellValue("Status")
                headerRow.createCell(20).setCellValue("Auflagen?")
                headerRow.createCell(21).setCellValue("Erfüllungsdatum")
                headerRow.createCell(22).setCellValue("Auflagen")

                // filter applications by current studyRegulation
                val currentApplications = applications.filter { application ->
                    // TODO: Global variable for semester based on current date
                    application?.appliedFor == studyRegulations[i].studyRegulationId &&
                        application.semester == "SoSe 2023"
                }

                // for every application in filtered applicationList do this
                for (j in 1..currentApplications.size) {
                    println("inFor")
                    // get Applicant of current application
                    val applicant = this.applicantDao.get(
                        currentApplications[j - 1]?.applicantId
                            ?: throw NotFoundResponse()
                    ).get()
                    // the row we are editing right now
                    val row = xlWs.createRow(j)

                    // fill every column with data from current applicant and/or current application
                    row.createCell(0).setCellValue(applicant?.firstName)
                    row.createCell(1).setCellValue(applicant?.lastName)
                    row.createCell(2).setCellValue(currentApplications[j - 1]?.admissionsOffice)
                    row.createCell(3).setCellValue(currentApplications[j - 1]?.method)
                    row.createCell(4).setCellValue(currentApplications[j - 1]?.applicationNumber)
                    row.createCell(5).setCellValue(currentApplications[j - 1]?.appliedForName)
                    row.createCell(6).setCellValue(currentApplications[j - 1]?.semester)
                    row.createCell(7).setCellValue(applicant?.mail)
                    row.createCell(8).setCellValue(applicant?.gender)
                    row.createCell(9).setCellValue(applicant?.salutation)
                    row.createCell(10).setCellValue(applicant?.country)
                    row.createCell(11).setCellValue(applicant?.city)
                    row.createCell(12).setCellValue(applicant?.street)
                    row.createCell(13).setCellValue(applicant?.nationality)
                    row.createCell(14).setCellValue(applicant?.birthOfDate)
                    row.createCell(15).setCellValue(currentApplications[j - 1]?.university)
                    row.createCell(16).setCellValue(applicant?.degree)
                    row.createCell(17).setCellValue(
                        if (currentApplications[j - 1]?.exam != null) { "Ja" } else { "Nein" }
                    )
                    if (currentApplications[j - 1]?.examIndex == null) {
                        row.createCell(18).setCellValue("")
                    } else {
                        val exam = this.examDao.get(currentApplications[j - 1]!!.exam!!).get()
                        val startDate = Date.from(exam!!.startTime[currentApplications[j - 1]!!.examIndex!!]).toString()
                        val endDate = Date.from(exam.endTime[currentApplications[j - 1]!!.examIndex!!]).toString()
                        row.createCell(18).setCellValue("$startDate $endDate")
                    }
                    row.createCell(19).setCellValue(currentApplications[j - 1]?.status)
                    row.createCell(20).setCellValue(
                        if (currentApplications[j - 1]?.conditions!!.isNotEmpty())"Ja" else "Nein"
                    )
                    row.createCell(21).setCellValue("")
                    row.createCell(22).setCellValue(currentApplications[j - 1]?.conditions!!.joinToString(","))
                }
                println("afterFor")
                // create file Stream for current studyRegulation
                val outputStream = FileOutputStream(studyRegulations[i].name + ".xlsx")
                // write created excel file into studyRegulation file
                xlWb.write(outputStream)
                // created file
                val file = File(studyRegulations[i].name + ".xlsx")
                // created Zip Entry
                val entry = ZipEntry(studyRegulations[i].name + ".xlsx")
                // put Entry into ZipFile
                zip.putNextEntry(entry)
                // write studyRegulation File into current Zip Entry
                zip.write(file.readBytes())
                // close OutputStream
                outputStream.close()
                // close workbook
                xlWb.close()
                // delete File to not waste memory
                file.delete()
                if (finalize) {
                    currentApplications.forEach { application ->
                        if (application!!.status == "invitedToExamAccepted") {
                            val index = studyRegulations[i].university.indexOf(application.university)
                            if (index != -1) {
                                println("If Teil")
                                studyRegulations[i].examAmount[index]++
                                studyRegulations[i].examPassed[index]++
                                application.conditions.forEach { condition ->
                                    studyRegulations[i].examConditions[index].add(condition)
                                }
                            } else {
                                println("Else Teil Export")
                                studyRegulations[i].university.add(application.university!!)
                                studyRegulations[i].examAmount.add(1)
                                studyRegulations[i].examPassed.add(1)
                                studyRegulations[i].examConditions.add(application.conditions)
                            }
                        } else if (application.status == "invitedToExamDenied") {
                            val index = studyRegulations[i].university.indexOf(application.university)
                            if (index != -1) {
                                studyRegulations[i].examAmount[index]++
                                application.conditions.forEach { condition ->
                                    studyRegulations[i].examConditions[index].add(condition)
                                }
                            } else {
                                studyRegulations[i].university.add(application.university!!)
                                studyRegulations[i].examAmount.add(1)
                                studyRegulations[i].examPassed.add(0)
                                studyRegulations[i].examConditions.add(application.conditions)
                            }
                        }
                        this.studyRegulationDao.update(studyRegulations[i])
                        this.identityManager.deleteApplication(application)
                    }
                }
            }
            studyRegulations.forEach { studyRegulation ->
                for (i in 0 until studyRegulation.university.size) {
                    val examPassed: Double = studyRegulation.examPassed[i].toDouble()
                    val examAmount: Double = studyRegulation.examAmount[i].toDouble()
                    val passRate = examPassed / examAmount
                    val time = LocalDateTime.now()
                    // TODO: Handle Conditions
                    if (passRate >= 0.9) {
                        println("passrate 0.9")
                        if (studyRegulation.conditions.size == 0) {
                            val ruleToAdd = Rule(
                                appliedFor = studyRegulation.studyRegulationId,
                                appliedForName = studyRegulation.name,
                                comment = "",
                                department = studyRegulation.department,
                                isActive = false,
                                isSystemGenerated = true,
                                log = "$time: " + studyRegulation.university[i] + " mit einer Bestehensquote von " +
                                    passRate + "\n",
                                newStatus = "accepted",
                                ruleId = UUID.randomUUID(),
                                serialLetter = "",
                                university = studyRegulation.university[i]
                            )
                            this.ruleDao.insert(ruleToAdd)
                        } else {
                            val conditions: MutableList<String> = studyRegulation.conditions
                            var amountCondition = DoubleArray(studyRegulation.conditions.size)
                            var createRule = true
                            studyRegulation.examConditions.forEach { list ->
                                list.forEach { condition ->
                                    amountCondition[conditions.indexOf(condition)]++
                                }
                            }
                            var offset = 0
                            for (j in 0 until studyRegulation.conditions.size) {
                                println(conditions)
                                println("Amount einer Auflage i " + amountCondition[j] + examAmount)
                                if ((amountCondition[j] / examAmount) <= 0.1) {
                                    println("cut")
                                    conditions.removeAt(j - offset)
                                    offset++
                                } else if ((amountCondition[j] / examAmount) >= 0.8) {
                                    println("nocut")
                                } else {
                                    createRule = false
                                }
                            }
                            if (createRule) {
                                val ruleToAdd = Rule(
                                    appliedFor = studyRegulation.studyRegulationId,
                                    appliedForName = studyRegulation.name,
                                    comment = "",
                                    condition = conditions,
                                    department = studyRegulation.department,
                                    isActive = false,
                                    isSystemGenerated = true,
                                    log = "$time: " + studyRegulation.university[i] + " mit einer Bestehensquote von " +
                                        passRate + "\n",
                                    newStatus = "accepted",
                                    ruleId = UUID.randomUUID(),
                                    serialLetter = "",
                                    university = studyRegulation.university[i]
                                )
                                this.ruleDao.insert(ruleToAdd)
                            }
                        }
                    }
                }
            }
            // TODO: Fix zip file not being deleted bug
            // final zip File
            val file = File("tables.zip")
            ctx.contentType("application/zip")
            // return zip File to Frontend
            ctx.result(file.inputStream())
            // close Zip Stream
            zip.close()
            // delete Zip FIle to save memory
            file.delete()
        } else {
            throw ForbiddenResponse()
        }
    }
}
