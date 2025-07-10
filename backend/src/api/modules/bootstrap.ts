import { BaseModel } from "./base-model";
import Company from "./companies/model";
import CompanyRepository from "./companies/repository";
import UserController from "./users/controller";
import User from "./users/model";
import UserRepository from "./users/repository";
import UserService from "./users/service";
import CompanyService, { ICompanyService, ICompanyServiceRepo } from "./companies/service";
import CompanyController from "./companies/controller";
import EmployeeRepository from "./employees/repository";
import EmployeeService, { IEmployeeServiceRepo } from "./employees/service";
import EmployeeController from "./employees/controller";
import Employee from "./employees/model";
import { ICompany } from "./companies/types";
import CredentialRepository from "./credentials/repository";
import Credential from "./credentials/model";
import { ICredential } from "./credentials/types";
import CredentialService, { ICredentialService } from "./credentials/service";
import CredentialController from "./credentials/controller";
import RoleRepository from "./roles/repository";
import Role from "./roles/model";
import RoleService from "./roles/service";
import RoleController from "./roles/controller";
import PermissionRepository from "./permissions/repository";
import Permission from "./permissions/model";
import PermissionService from "./permissions/service";
import PermissionController from "./permissions/controller";
import ProviderRepository from "./providers/repository";
import ProviderService from "./providers/service";
import Provider from "./providers/model";
import ProviderController from "./providers/controller";
import Product from "./products/model";
import ProductRepository from "./products/repository";
import ProductService from "./products/service";
import ProductController from "./products/controller";
import Zone from './zones/model';
import ZoneRepository from './zones/repository';
import ZoneService from './zones/service';
import ZoneController from './zones/controller';
import Payment from './payments/model';
import PaymentRepository from './payments/repository';
import PaymentService from './payments/service';
import PaymentController from './payments/controller';
import Discount from './discounts/model';
import DiscountRepository from './discounts/repository';
import DiscountService from './discounts/service';
import DiscountController from './discounts/controller';
import Inventory from './inventory/model';
import InventoryRepository from './inventory/repository';
import InventoryService from './inventory/service';
import InventoryController from './inventory/controller';
import Invoice from './invoices/model';
import InvoiceRepository from './invoices/repository';
import InvoiceService from './invoices/service';
import InvoiceController from './invoices/controller';
import InvoiceItem from './invoice-items/model';
import InvoiceItemRepository from './invoice-items/repository';
import InvoiceItemService from './invoice-items/service';
import InvoiceItemController from './invoice-items/controller';
import BillRepository from "./bills/repository";
import Bill from "./bills/model";
import BillService from "./bills/service";
import BillController from "./bills/controller";
import InventoryTransaction from './inventory-transactions/model';
import InventoryTransactionRepository from './inventory-transactions/repository';
import InventoryTransactionService from './inventory-transactions/service';
import InventoryTransactionController from './inventory-transactions/controller';
import ProductReturn from './product-returns/model';
import ProductReturnRepository from './product-returns/repository';
import ProductReturnService from './product-returns/service';
import ProductReturnController from './product-returns/controller';
import ProductReturnItem from './product-return-items/model';
import ProductReturnItemRepository from './product-return-items/repository';
import ProductReturnItemService from './product-return-items/service';
import ProductReturnItemController from './product-return-items/controller';

// Credential
export const credentialRepository = new CredentialRepository(Credential as unknown as BaseModel<ICredential>);
export const credentialService = new CredentialService(credentialRepository);
export const credentialController = new CredentialController(credentialService);

// Users
export const userRepository = new UserRepository(User);
export const userService = new UserService(userRepository);
export const userController = new UserController(userService);

// Roles
export const roleRepository = new RoleRepository(Role);
export const roleService = new RoleService(roleRepository);
export const roleController = new RoleController(roleService);

// Roles
export const permissionRepository = new PermissionRepository(Permission);
export const permissionService = new PermissionService(permissionRepository);
export const permissionController = new PermissionController(permissionService);

// Company
export const companyRepository = new CompanyRepository(Company as unknown as BaseModel<ICompany>);
export const companyService = new CompanyService(companyRepository as unknown as ICompanyServiceRepo);
export const companyController = new CompanyController(companyService as ICompanyService);

// Employee
export const employeeRepository = new EmployeeRepository(Employee);
export const employeeService = new EmployeeService(employeeRepository as unknown as IEmployeeServiceRepo);
export const employeeController = new EmployeeController(employeeService);

//Providers
export const providerRepository = new ProviderRepository(Provider);
export const providerService = new ProviderService(providerRepository);
export const providerController = new ProviderController(providerService);

//Products
export const productRepository = new ProductRepository(Product);
export const productService = new ProductService(productRepository);
export const productController = new ProductController(productService);

export const zoneRepository = new ZoneRepository(Zone);
export const zoneService = new ZoneService(zoneRepository);
export const zoneController = new ZoneController(zoneService);

export const paymentRepository = new PaymentRepository(Payment);
export const paymentService = new PaymentService(paymentRepository);
export const paymentController = new PaymentController(paymentService);

export const discountRepository = new DiscountRepository(Discount);
export const discountService = new DiscountService(discountRepository);
export const discountController = new DiscountController(discountService);

export const inventoryRepository = new InventoryRepository(Inventory);
export const inventoryService = new InventoryService(inventoryRepository);
export const inventoryController = new InventoryController(inventoryService);

export const invoiceRepository = new InvoiceRepository(Invoice);
export const invoiceService = new InvoiceService(invoiceRepository);
export const invoiceController = new InvoiceController(invoiceService);

export const invoiceItemRepository = new InvoiceItemRepository(InvoiceItem);
export const invoiceItemService = new InvoiceItemService(invoiceItemRepository, invoiceService);
export const invoiceItemController = new InvoiceItemController(invoiceItemService);

export const billRepository = new BillRepository(Bill);
export const billService = new BillService(billRepository);
export const billController = new BillController(billService);

export const inventoryTransactionRepository = new InventoryTransactionRepository(InventoryTransaction);
export const inventoryTransactionService = new InventoryTransactionService(inventoryTransactionRepository);
export const inventoryTransactionController = new InventoryTransactionController(inventoryTransactionService);

export const productReturnItemRepository = new ProductReturnItemRepository(ProductReturnItem);
export const productReturnItemService = new ProductReturnItemService(productReturnItemRepository);
export const productReturnItemController = new ProductReturnItemController(productReturnItemService);

export const productReturnRepository = new ProductReturnRepository(ProductReturn);
export const productReturnService = new ProductReturnService(productReturnRepository, productReturnItemRepository);
export const productReturnController = new ProductReturnController(productReturnService);
