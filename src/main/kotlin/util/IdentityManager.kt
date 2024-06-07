package util

import com.google.inject.Inject
import data.bean.Applicant
import data.bean.Application
import data.dao.ApplicantDao
import data.dao.ApplicationDao
import data.dao.UserDao
import io.javalin.http.NotFoundResponse

/**
 * @author Michael
 * @since 29.09.2022
 */
class IdentityManager @Inject constructor(
    private val applicantDao: ApplicantDao,
    private val applicationDao: ApplicationDao,
    private val userDao: UserDao
) {

    /**
     * Tries to map an application to an applicant based on 2 rules
     * 1. Rule: matching E-Mails
     * 2. Rule: matching lastName, firstName and street
     * @param mail mail of the Applicant to search for
     * @param firstName first Name of the Applicant to search for
     * @param lastName last name of the Applicant to search for
     * @param street street of the Applicant to search for
     * @return Applicant found based on Rules if none was found returns null
     */
    fun findExistingApplicant(mail: String, firstName: String, lastName: String, street: String): Applicant? {
        val applicant: Applicant? = if (applicantDao.getWithMail(mail).get() != null) {
            applicantDao.getWithMail(mail).get()
        } else {
            applicantDao.getWithNameAndStreet(lastName, firstName, street).get()
        }
        println(applicant)
        return applicant
    }

    /**
     * Deletes an Application and checks if related Applicant has 0 Applications after Deletion if yes make him inactive
     * @param application the application to Delete
     */
    fun deleteApplication(application: Application) {
        val applicant = this.applicantDao.get(application.applicantId).get() ?: throw NotFoundResponse()
        this.applicationDao.delete(application)
        applicant.applications.remove(application.applicationNumber)
        if (applicant.applications.size == 0) {
            val user = this.userDao.get(application.applicantId).get() ?: throw NotFoundResponse()
            this.applicantDao.delete(applicant)
            this.userDao.delete(user)
        } else {
            this.applicantDao.update(applicant)
        }
    }

    /**
     * get a preconfigured email object.
     * This function and the properties set in it should not be changed!
     */
    /*private fun createPreconfiguredEmail(): SimpleEmail {
        val email = SimpleEmail()
        email.hostName = args.mailSmtpHost
        email.isStartTLSEnabled = args.mailSmtpStartTls
        if (args.mailSmtpTls) {
            email.sslSmtpPort = args.mailSmtpPort.toString()
            email.isSSLOnConnect = args.mailSmtpTls
        } else {
            email.setSmtpPort(args.mailSmtpPort!!)
        }
        if (args.mailSmtpUsername != null && args.mailSmtpPassword != null) {
            email.setAuthenticator(DefaultAuthenticator(args.mailSmtpUsername, args.mailSmtpPassword))
        }
        email.setFrom(args.mailSmtpSender)

        return email
    }*/
}
