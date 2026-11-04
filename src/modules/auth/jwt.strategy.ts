/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

// Valida los access tokens de Supabase Auth con las claves públicas del proyecto (JWKS)
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const authUrl = `${process.env.SUPABASE_URL}/auth/v1`;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer: authUrl,
      audience: 'authenticated',
      algorithms: ['ES256', 'RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${authUrl}/.well-known/jwks.json`,
      }),
    });
  }

  validate(payload: any) {
    return payload;
  }
}
