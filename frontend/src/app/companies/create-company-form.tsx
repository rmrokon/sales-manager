'use client';
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { isRtkQueryError } from "@/lib/utils";
import { useCreateCompanyMutation } from "@/store/services/company";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const companySchema = z.object({
    name: z.string().nonempty({ message: 'Company name is required' })
});

type ICompany = z.infer<typeof companySchema>;

export default function CreateCompanyForm() {
    const [comapnyMutation, {isLoading}] = useCreateCompanyMutation();
    const {toast} = useToast();
    const router = useRouter();
    const {
        handleSubmit,
        register,
        formState: {errors}
    } = useForm<ICompany>({
        resolver: zodResolver(companySchema),
        mode: 'all',
        reValidateMode: 'onChange'
    });
    const handleCreateChannel = async (data: ICompany)=>{
        const result = await comapnyMutation(data);
                if (isRtkQueryError(result) && result.error.data.success === false) {
                    toast({
                        variant: "destructive",
                        description: `${result.error.data.message}`
                    });
                } else {
                    router.replace('/companies');
                }
    };
    if(isLoading) return <Spinner />;
    return <form className="grid gap-6" onSubmit={handleSubmit(handleCreateChannel)}>
        <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
                id="name"
                {...register("name")}
            />
        </div>
        {errors.name?.message && <ErrorMessage message={errors.name?.message} />}
        <Button>Create</Button>
    </form>
}