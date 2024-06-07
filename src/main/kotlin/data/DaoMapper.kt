package data.dao

import com.datastax.oss.driver.api.core.CqlSession
import com.datastax.oss.driver.api.mapper.annotations.DaoFactory
import com.datastax.oss.driver.api.mapper.annotations.DaoKeyspace
import com.datastax.oss.driver.api.mapper.annotations.Mapper
import com.google.inject.Inject
import com.google.inject.Provider
import core.config.Args

/**
 * @author Frank Nelles
 * @since 13.06.2020
 */
@Mapper
@Suppress("ComplexInterface")
interface DaoMapper {
    /**
     * Create userDao
     */
    @DaoFactory
    fun userDao(@DaoKeyspace keyspace: String): UserDao

    /**
     * Create userConfigurationDao
     */
    @DaoFactory
    fun userConfigurationDao(@DaoKeyspace keyspace: String): UserConfigurationDao

    /**
     * Create RuleDao
     */
    @DaoFactory
    fun ruleDao(@DaoKeyspace keyspace: String): RuleDao

    /**
     * Create examRegulationDao
     */
    @DaoFactory
    fun studyRegulationDao(@DaoKeyspace keyspace: String): StudyRegulationDao

    /**
     * Create applicantDao
     */
    @DaoFactory
    fun applicationDao(@DaoKeyspace keyspace: String): ApplicationDao

    /**
     * Create examDao
     */
    @DaoFactory
    fun examDao(@DaoKeyspace keyspace: String): ExamDao

    /**
     * Create examLocationDao
     */
    @DaoFactory
    fun examLocationDao(@DaoKeyspace keyspace: String): ExamLocationDao

    /**
     * Create applicantDao
     */
    @DaoFactory
    fun applicantDao(@DaoKeyspace keyspace: String): ApplicantDao

    /**
     * Create qsScoreDao
     */
    @DaoFactory
    fun qsScoreDao(@DaoKeyspace keyspace: String): QSScoreDao

    /**
     * Create classifierDao
     */
    @DaoFactory
    fun classifierDao(@DaoKeyspace keyspace: String): ClassifierDao
}

/**
 * @author Frank Nelles
 * @since 13.06.2020
 */
class DaoMapperProvider @Inject constructor(
    private val session: CqlSession
) : Provider<DaoMapper> {
    override fun get(): DaoMapper = DaoMapperBuilder(session).build()
}

/**
 * @author Frank Nelles
 * @since 10.01.2022
 */
class UserConfigurationDaoProvider @Inject constructor(
    private val daoMapper: DaoMapper,
    private val args: Args
) : Provider<UserConfigurationDao> {
    override fun get(): UserConfigurationDao = daoMapper.userConfigurationDao(args.keyspace)
}

/**
 * @author Frank Nelles
 * @since 13.06.2020
 */
class UserDaoProvider @Inject constructor(
    private val daoMapper: DaoMapper,
    private val args: Args
) : Provider<UserDao> {
    override fun get(): UserDao = daoMapper.userDao(args.keyspace)
}

/**
 * @author Frank Nelles
 * @since 13.06.2020
 */
class RuleDaoProvider @Inject constructor(
    private val daoMapper: DaoMapper,
    private val args: Args
) : Provider<RuleDao> {
    override fun get(): RuleDao = daoMapper.ruleDao(args.keyspace)
}

/**
 * @author Frank Nelles
 * @since 13.06.2020
 */
class StudyRegulationDaoProvider @Inject constructor(
    private val daoMapper: DaoMapper,
    private val args: Args
) : Provider<StudyRegulationDao> {
    override fun get(): StudyRegulationDao = daoMapper.studyRegulationDao(args.keyspace)
}

/**
* @author Frank Nelles
* @since 13.06.2020
*/
class ApplicationDaoProvider @Inject constructor(
    private val daoMapper: DaoMapper,
    private val args: Args
) : Provider<ApplicationDao> {
    override fun get(): ApplicationDao = daoMapper.applicationDao(args.keyspace)
}

/**
 * @author Frank Nelles
 * @since 13.06.2020
 */
class ExamDaoProvider @Inject constructor(
    private val daoMapper: DaoMapper,
    private val args: Args
) : Provider<ExamDao> {
    override fun get(): ExamDao = daoMapper.examDao(args.keyspace)
}

/**
 * @author Michael
 * @since 21.09.2022
 */
class ExamLocationDaoProvider @Inject constructor(
    private val daoMapper: DaoMapper,
    private val args: Args
) : Provider<ExamLocationDao> {
    override fun get(): ExamLocationDao = daoMapper.examLocationDao(args.keyspace)
}

/**
 * @author Michael
 * @since 21.09.2022
 */
class ApplicantDaoProvider @Inject constructor(
    private val daoMapper: DaoMapper,
    private val args: Args
) : Provider<ApplicantDao> {
    override fun get(): ApplicantDao = daoMapper.applicantDao(args.keyspace)
}

/**
 * @author lauritzrasbach
 * @since 06.11.2023
 */
class QSScoreDaoProvider @Inject constructor(
    private val daoMapper: DaoMapper,
    private val args: Args
) : Provider<QSScoreDao> {
    override fun get(): QSScoreDao = daoMapper.qsScoreDao(args.keyspace)
}

/**
 * @author lauritzrasbach
 * @since 06.11.2023
 */
class ClassifierDaoProvider @Inject constructor(
    private val daoMapper: DaoMapper,
    private val args: Args
) : Provider<ClassifierDao> {
    override fun get(): ClassifierDao = daoMapper.classifierDao(args.keyspace)
}
