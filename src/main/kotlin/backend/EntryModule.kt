package backend

import backend.applicant.ApplicantModule
import backend.application.ApplicationModule
import backend.auth.AuthModule
import backend.classifier.ClassifierModule
import backend.download.DownloadModule
import backend.email.EmailModule
import backend.exam.ExamModule
import backend.examLocation.ExamLocationModule
import backend.examples.ExampleModule
import backend.exchange.ExchangeModule
import backend.qsScore.QSScoreModule
import backend.rule.RuleModule
import backend.studyRegulation.StudyRegulationModule
import backend.user.UserModule
import backend.version.VersionModule
import dev.misfitlabs.kotlinguice4.KotlinModule

/**
 * @author Leon Camus
 * @since 05.02.2020
 */
object EntryModule : KotlinModule() {
    override fun configure() {
        install(AuthModule)
        install(EmailModule)
        install(ExchangeModule)
        install(ExampleModule)
        install(UserModule)
        install(VersionModule)
        install(ApplicationModule)
        install(StudyRegulationModule)
        install(RuleModule)
        install(ExamModule)
        install(ExamLocationModule)
        install(ApplicantModule)
        install(DownloadModule)
        install(QSScoreModule)
        install(ClassifierModule)
    }
}
