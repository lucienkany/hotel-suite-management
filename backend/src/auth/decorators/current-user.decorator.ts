import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    // Add companyId to the user object for easier access
    if (user && user.company && user.company.id) {
      return {
        ...user,
        companyId: user.company.id,
      };
    }

    return request.user;
  }
);
