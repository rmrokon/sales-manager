'use client';
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialog } from "@/hooks/use-dialog";
import { useToast } from "@/hooks/use-toast";
import { isRtkQueryError } from "@/lib/utils";
import { useCreateProviderMutation, useUpdateProviderMutation } from "@/store/services/provider";
import { RootState } from "@/store/store";
import { IProvider } from "@/utils/types/provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";

const providerSchema = z.object({
    name: z.string().nonempty({ message: 'Provider name is required' })
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProviderFormProps {
  defaultValues?: Partial<IProvider>;
  onSuccess?: () => void;
}

export default function ProviderForm({ defaultValues }: ProviderFormProps) {
    const [createProvider, { isLoading: isCreating }] = useCreateProviderMutation();
    const [updateProvider, { isLoading: isUpdating }] = useUpdateProviderMutation();
    const { company } = useSelector((state: RootState) => state.auth);
    const {
        close
    } = useDialog();
    const { toast } = useToast();
    const router = useRouter();
    
    const isEditing = Boolean(defaultValues?.id);
    const isLoading = isCreating || isUpdating;
    
    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<ProviderFormData>({
        resolver: zodResolver(providerSchema),
        mode: 'all',
        reValidateMode: 'onChange',
        defaultValues: {
          name: defaultValues?.name || ''
        }
    });
    
    const handleSaveProvider = async (data: ProviderFormData) => {
        let result;
        
        if (isEditing && defaultValues?.id) {
            result = await updateProvider({
                providerId: defaultValues.id,
                ...data
            });
        } else {
            result = await createProvider({...data, company_id: company?.id});
        }
        
        if (isRtkQueryError(result) && result.error.data.success === false) {
            toast({
                variant: "destructive",
                description: `${result.error.data.message}`
            });
        } else {
            router.refresh();
            toast({
                description: isEditing 
                    ? "Provider updated successfully" 
                    : "Provider created successfully"
            });
            // setIsOpen(false);
            close?.();
        }
    };
    
    if (isLoading) return <h3>Loading...</h3>;
    
    return (
        <form className="grid gap-6" onSubmit={handleSubmit(handleSaveProvider)}>
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    {...register("name")}
                />
            </div>
            {errors.name?.message && <ErrorMessage message={errors.name?.message} />}
            <Button>{isEditing ? 'Update' : 'Create'}</Button>
        </form>
    );
}