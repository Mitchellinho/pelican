import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {AuthGuardService} from "./shared/auth/auth-guard.service";

/**
 * @author Leon Camus
 */
@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: "",
                loadChildren: () => import("./login/login.module").then(m => m.LoginModule),
            },
            {
                path: "login",
                loadChildren: () => import("./login/login.module").then(m => m.LoginModule),
            },
            {
                path: "example",
                loadChildren: () => import("./example/example.module").then(m => m.ExampleModule),
            },
            {
                path: "exam",
                loadChildren: () => import("./exam/exam.module").then(m => m.ExamModule),
                canActivate: [AuthGuardService],
            },
            {
                path: "examlocation",
                loadChildren: () => import("./exam-location/exam-location.module").then(m => m.ExamLocationModule),
                canActivate: [AuthGuardService],
            },
            {
                path: "home",
                loadChildren: () => import("./home/home.module").then(m => m.HomeModule),
            },
            {
                path: "applications",
                loadChildren: () => import("./application/application.module").then(m => m.ApplicationModule),
                canActivate: [AuthGuardService],
            },
            {
                path: "users",
                loadChildren: () => import("./userlist/userlist.module").then(m => m.UserlistModule),
                canActivate: [AuthGuardService],
            },
            {
                path: "serialletter",
                loadChildren: () => import("./serialletter/serialletter.module").then(m => m.SerialletterModule),
                canActivate: [AuthGuardService],
            },
            {
                path: "rules",
                loadChildren: () => import("./rule/rule.module").then(m => m.RuleModule),
                canActivate: [AuthGuardService],
            },
            {
                path: "learners",
                loadChildren: () => import("./learner/learner.module").then(m => m.LearnerModule),
                canActivate: [AuthGuardService],
            },
            {
                path: "report",
                loadChildren: () => import("./report/report.module").then(m => m.ReportModule),
                canActivate: [AuthGuardService],
            },
            {
                path: "studyregulations",
                loadChildren: () => import("./study-regulation/study-regulation.module").then(m => m.StudyRegulationModule),
                canActivate: [AuthGuardService],
            },
            {
                path: "user",
                loadChildren: () => import("./user/user.module").then(m => m.UserModule),
            },
            {
                // fallback URL when nothing else matches
                path: "**",
                loadChildren: () => import("./shared/static/not-found.module").then(m => m.NotFoundModule),
            },
        ]),
    ],
    exports: [
        RouterModule,
    ],
})
export class AppRoutingModule {
}
