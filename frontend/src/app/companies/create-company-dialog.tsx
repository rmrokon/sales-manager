import { Modal } from "@/components";
import CreateCompanyForm from "./create-company-form";

export default function CreateCompanyDialog(){
    return <Modal title="Create company" trigger={<>{'+ Create'}</>}>
      <CreateCompanyForm />
    </Modal>
}