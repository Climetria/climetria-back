/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthController {
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  login(@Request() req) {
    return req.user;
  }
}
