import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { User } from "./user.model";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";


export interface authResponseData {
    king: String,
    idToken: string,
    refreshToken: string,
    expiresIn: string,
    email: string,
    localId: string,
    register?: boolean
}
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient,
        private router: Router
    ) { }

    signup(email: string, password: string) {
        return this.http.post<authResponseData>
            ('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseApiKey,
                {
                    email: email,
                    password: password,
                    returnSecureToken: true
                }
            )
            .pipe(catchError(this.handleError), tap(resData => {
                this.handleAuth(
                    resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn
                )
            }))
    }

    login(email: string, password: string) {
        return this.http.post<authResponseData>
            ('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseApiKey,
                {
                    email: email,
                    password: password,
                    returnSecureToken: true
                }
            )
            .pipe(catchError(this.handleError), tap(resData => {
                this.handleAuth(
                    resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn
                )
            }))
    }

    autoLogin() {


        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'))

        if (!userData)
            return;
        const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate)
        )
        if (loadedUser.token) {
            this.user.next(loadedUser);
            const expirationDuration =
                new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            // console.log(expirationDuration);

            this.autoLogout(expirationDuration);
        }

    }
    logout() {
        this.user.next(null);
        this.router.navigate(['/auth'])
        localStorage.removeItem('userData');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }
    autoLogout(expirationDuration: number) {
        // console.log(expirationDuration);

        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);

    }

    private handleAuth(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
        );
        const user = new User(
            email,
            userId,
            token,
            expirationDate
        );
        this.user.next(user);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user))
    }

    private handleError(errRes: HttpErrorResponse) {
        let errorMessage = 'An unknow error occured!'
        console.log(errRes);

        if (!errRes.error || !errRes.error.error) {
            return throwError(errorMessage)
        }

        switch (errRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'this email exist already!';
                break;
            case 'INVALID_LOGIN_CREDENTIALS':
                errorMessage = 'Invalid Login Credentials';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'This password is not correct.';
                break;


        }
        return throwError(errorMessage);
    }
}