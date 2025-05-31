import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;

  constructor(private readonly configService: ConfigService) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.configService.get<string>('COGNITO_USER_POOL_ID', ''),
      ClientId: this.configService.get<string>('COGNITO_CLIENT_ID', ''),
    });
  }

  private getCognitoUser(email: string): CognitoUser {
    return new CognitoUser({ Username: email, Pool: this.userPool });
  }

  async signUp(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, password, [], [], (err, result) => {
        if (err) {
          console.error('SignUp error:', err);
          return reject(err);
        }
        console.log('SignUp result:', result);
        resolve(result); // result?.userSub
      });
    });
  }

  async signIn(email: string, password: string): Promise<string> {
    const user = this.getCognitoUser(email);
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    return new Promise((resolve, reject) => {
      user.authenticateUser(authDetails, {
        onSuccess: (session: CognitoUserSession) =>
          resolve(session.getIdToken().getJwtToken()),
        onFailure: (err) => {
          console.error('SignIn error:', err);
          reject(err);
        },
      });
    });
  }

  async confirmSignUp(email: string, code: string): Promise<string> {
    const user = this.getCognitoUser(email);
    return new Promise((resolve, reject) => {
      user.confirmRegistration(code, true, (err, result) => {
        if (err) {
          console.error('ConfirmSignUp error:', err);
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}
