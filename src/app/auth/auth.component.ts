import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService, authResponseData } from "./auth.service";
import { Observable, Subscription } from "rxjs";
import { Router } from "@angular/router";

import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceHolderDirective } from "../shared/placeholder/placeholder.directive";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent {
    isLoginMode = true;
    isLoading = false;
    error: string = null;
    // @ViewChild(PlaceHolderDirective, { static: false }) alertHost: PlaceHolderDirective;
    // private closeSub: Subscription;


    constructor(private autService: AuthService,
        private router: Router,
        // private componenetFactoryResolver: ComponentFactoryResolver
    ) { }
    onSwithcMode() {
        this.isLoginMode = !this.isLoginMode;
    }
    onSubmit(form: NgForm) {
        if (!form.valid)
            return;
        // console.log(form.value);

        const email = form.value.email;
        const password = form.value.password;

        let authObs: Observable<authResponseData>

        this.isLoading = true;
        if (this.isLoginMode) {
            authObs = this.autService.login(email, password)
        }
        else {
            authObs = this.autService.signup(email, password)
        }
        authObs.subscribe(
            (resData) => {
                console.log(resData);
                this.isLoading = false;
                this.router.navigate(['/recipes'])
            },
            (errorMessage) => {
                this.error = errorMessage;
                // this.showErrorAlert(errorMessage);
                this.isLoading = false;
            }
        )
        form.reset()

    }

    onHandleError() {
        this.error = null;
    }

    // ngOnDestroy(): void {
    //     if (this.closeSub)
    //         this.closeSub.unsubscribe()
    // }
    // private showErrorAlert(errorMessage: string) {
    //     // const alertCmp = new AlertComponent();
    //     const alertCmpFactory = this.componenetFactoryResolver
    //         .resolveComponentFactory(AlertComponent);

    //     const hostViewContainerRef = this.alertHost.viewContainerRef;
    //     hostViewContainerRef.clear();

    //     const conmonentRef = hostViewContainerRef.createComponent(alertCmpFactory)
    //     conmonentRef.instance.message = errorMessage;
    //     this.closeSub = conmonentRef.instance.close.subscribe(() => {
    //         this.closeSub.unsubscribe();
    //         hostViewContainerRef.clear();
    //     });
    // }
}