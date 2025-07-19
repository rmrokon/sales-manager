import { DataTable, SimpleColumn, ActionButton } from "@/components/ui/reusable-table"
import { Trash } from "lucide-react"


interface Employee {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export default function EmployeesTable() {
    // Placeholder data - replace with actual API call
    const employees: Employee[] = [
        {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            createdAt: new Date().toISOString()
        }
    ];

    const columns: SimpleColumn<Employee>[] = [
        {
            key: 'name',
            header: 'Employee Name',
            className: 'font-medium'
        },
        {
            key: 'email',
            header: 'Email'
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (value) => new Date(value as string).toLocaleDateString()
        }
    ];

    const actions: ActionButton<Employee>[] = [
        {
            type: 'edit',
            onClick: (employee) => {
                // TODO: Implement edit functionality
                console.log('Edit employee:', employee.id);
            }
        },
        {
            type: 'delete',
            icon: <Trash className="h-4 w-4" />,
            onClick: (employee) => {
                // TODO: Implement delete functionality
                console.log('Delete employee:', employee.id);
            },
            confirmMessage: "Are you sure you want to delete this employee?"
        }
    ];

    return (
        <DataTable
            data={employees}
            columns={columns}
            actions={actions}
            isLoading={false}
            keyExtractor={(employee) => employee.id}
            emptyMessage="No employees found"
        />
    )
}