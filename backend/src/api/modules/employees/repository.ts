import { ICreateEmployee, IEmployee } from './types';
import DefaultRepository from '../default-repo';
import Employee from './model';
import { BaseRepository } from '../baseRepo';

export default class EmployeeRepository extends DefaultRepository<Employee> implements BaseRepository<IEmployee, ICreateEmployee> {
  _model;

  constructor(model: typeof Employee) {
    super();
    this._model = model;
  }
}
