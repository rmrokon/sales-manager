import { CompanyRouter } from "./companies";
import { CredentialRouter } from "./credentials";
import { EmployeeRouter } from "./employees";
import { UserRouter } from "./users";
import { ProviderRouter } from "./providers";
import { ProductRouter } from "./products";
import { ZoneRouter } from "./zones";
import { PaymentRouter } from "./payments";
import { InventoryRouter } from "./inventory";
import { DiscountRouter } from "./discounts";
import { InvoiceRouter } from "./invoices";
import { InvoiceItemRouter } from "./invoice-items";
import { BillRouter } from "./bills";
import { InventoryTransactionRouter } from "./inventory-transactions";
import { ProductReturnRouter } from "./product-returns";
import { ProductReturnItemRouter } from "./product-return-items";

export const ROUTES = {
    '/users': UserRouter,
    '/companies': CompanyRouter,
    '/employees': EmployeeRouter,
    '/credentials': CredentialRouter,
    '/providers': ProviderRouter,
    '/products': ProductRouter,
    '/zones': ZoneRouter,
    '/payments': PaymentRouter,
    '/inventory': InventoryRouter,
    '/discounts': DiscountRouter,
    '/invoices': InvoiceRouter,
    '/invoice-items': InvoiceItemRouter,
    '/bills': BillRouter,
    '/inventory-transactions': InventoryTransactionRouter,
    '/returns': ProductReturnRouter,
    '/return-items': ProductReturnItemRouter,
}
