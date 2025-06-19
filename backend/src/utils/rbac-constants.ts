export enum AccessModules {
    Dashboard = "Dashboard",
    Company = "Company",
    Employee = "Employee",
    Channel = "Channel",
    Video = "Video",
    Role = "Role",
    Payment = "Payment"
  }
  
  export enum Permissions {
    // Company
    ReadCompany = "read:company",
    CreateCompany = "create:company",
    UpdateCompany = "update:company",
    DeleteCompany = "delete:company",
    SwitchCompany = "switch:company",
    // Employee
    ReadEmployee = "read:employee",
    CreateEmployee = "create:employee",
    UpdateEmployee = "update:employee",
    DeleteEmployee = "delete:employee",
    
    // Role
    ReadRole = "read:role",
    CreateRole = "create:role",
    UpdateRole = "update:role",
    DeleteRole = "delete:role",

    // Channel
    ReadChannel = "read:channel",
    CreateChannel = "create:channel",
    UpdateChannel = "update:channel",
    DeleteChannel = "delete:channel",

    // Video
    ReadVideo = "read:video",
    CreateVideo = "create:video",
    UpdateVideo = "update:video",
    DeleteVideo = "delete:video",
    YoutubeUpload = "upload:video",

    // payment
    ReadPayment = "read:payment",
    CreatePayment = "create:payment",
    UpdatePayment = "update:payment",
    DeletePayment = "delete:payment",
  }
  
  export enum DefaultRoles {
    Admin = "admin",
    Employee = "employee",
  }
  
  