import { CompanyRouter } from "./companies";
import { CredentialRouter } from "./credentials";
import { EmployeeRouter } from "./employees";
import { UserRouter } from "./users";
import { ProviderRouter } from "./providers";

export const ROUTES = {
    '/users': UserRouter,
    '/companies': CompanyRouter,
    '/employees': EmployeeRouter,
    '/credentials': CredentialRouter,
    '/providers': ProviderRouter
}