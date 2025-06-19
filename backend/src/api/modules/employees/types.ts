import z from "zod";
import {EmployeeCreationValidationSchema, EmployeeUpdateValidationSchema} from './validations'
import { Attributes, CreationAttributes } from "@sequelize/core";
import Employee from "./model";

export interface IEmployee extends Attributes<Employee> {};
export type ICreateEmployee = CreationAttributes<Employee>;

export type IEmployeeCreationBody = z.infer<typeof EmployeeCreationValidationSchema>;
export type IEmployeeUpdateBody = z.infer<typeof EmployeeUpdateValidationSchema>;
