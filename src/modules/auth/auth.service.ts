/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId = process.env.COGNITO_USER_POOL_ID!;
  private readonly region = process.env.AWS_REGION || 'us-east-1';
  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.region,
    });
  }

  async createOrGetCognitoUser(
    email: string,
    groupName?: string,
  ): Promise<string> {
    let username: string;

    try {
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });

      const response = await this.cognitoClient.send(getUserCommand);
      username = response.Username!;
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        const createUserCommand = new AdminCreateUserCommand({
          UserPoolId: this.userPoolId,
          Username: email,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' },
          ],
        });

        const createResponse = await this.cognitoClient.send(createUserCommand);
        username = createResponse.User?.Username ?? email;
      } else {
        console.error('Error checking user in Cognito:', error);
        throw new InternalServerErrorException('Failed to get or create user');
      }
    }

    // ✅ Add to group if provided
    if (groupName) {
      try {
        const addToGroupCommand = new AdminAddUserToGroupCommand({
          UserPoolId: this.userPoolId,
          Username: username,
          GroupName: groupName,
        });

        await this.cognitoClient.send(addToGroupCommand);
      } catch (err) {
        console.error('Failed to add user to group:', err);
        throw new InternalServerErrorException(
          'User created but could not be added to group',
        );
      }
    }

    return username;
  }
}
