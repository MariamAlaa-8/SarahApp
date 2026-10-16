import { TokenTypeEnum } from "../common/enum/security.enum.js";
import { UnauthorizedException, ForbiddenException } from "../common/exceptions/index.js";
import { basicAuth, decodeToken } from "../common/security/token.security.js";
export const bearerAuth=async({req,tokenType=TokenTypeEnum.ACCESS}) => {
 const [key, credential] =req.headers[ "authorization"].split(' ') || [];
   const { user, payload } = await decodeToken({ authorization: credential, tokenType });
                    req.user = user;
                    req.payload = payload;
}
export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers;

            if (!authorization) {
                throw UnauthorizedException("Unauthorized Account");
            }

            const [key, credential] = authorization.split(' ') || [];

            switch (key) {
                case "Basic": {
                    const [email, password] = Buffer.from(credential, 'base64').toString()?.split(":");
                    req.user = await basicAuth({ email, password });
                    break;
                }
                case "Bearer": {
                    await bearerAuth({req,tokenType})
                    break;
                }
                default: {
                    throw new Error("Invalid authentication schema", { cause: { status: 400 } });
                }
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}

export const authorization = (accessRoles = []) => {
    return async (req, res, next) => {
        try {
            if (!accessRoles.includes(req.user.role)) {
                throw ForbiddenException("Forbidden Account");
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}