package data.dao

import dev.misfitlabs.kotlinguice4.KotlinModule

/**
 * @author Frank Nelles
 * @since 13.06.2020
 */
object DataModule : KotlinModule() {
    override fun configure() {
        bind<DaoMapper>().toProvider<DaoMapperProvider>()

        bind<UserConfigurationDao>().toProvider<UserConfigurationDaoProvider>()
        bind<UserDao>().toProvider<UserDaoProvider>()
        bind<RuleDao>().toProvider<RuleDaoProvider>()
        bind<StudyRegulationDao>().toProvider<StudyRegulationDaoProvider>()
        bind<ApplicationDao>().toProvider<ApplicationDaoProvider>()
        bind<ExamDao>().toProvider<ExamDaoProvider>()
        bind<ExamLocationDao>().toProvider<ExamLocationDaoProvider>()
        bind<ApplicantDao>().toProvider<ApplicantDaoProvider>()
        bind<QSScoreDao>().toProvider<QSScoreDaoProvider>()
        bind<ClassifierDao>().toProvider<ClassifierDaoProvider>()
    }
}
