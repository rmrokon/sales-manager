'use client';
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useDialog } from "@/hooks/use-dialog";
import { useToast } from "@/hooks/use-toast";
import { isRtkQueryError } from "@/lib/utils";
import { useCreateZoneMutation, useUpdateZoneMutation, Zone } from "@/store/services/zone";
import { RootState } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";

const zoneSchema = z.object({
    name: z.string().nonempty({ message: 'Zone name is required' })
});

type ZoneFormData = z.infer<typeof zoneSchema>;

interface ZoneFormProps {
  defaultValues?: Partial<Zone>;
  onSuccess?: () => void;
}

export default function ZoneForm({ defaultValues }: ZoneFormProps) {
    const [createZone, { isLoading: isCreating }] = useCreateZoneMutation();
    const [updateZone, { isLoading: isUpdating }] = useUpdateZoneMutation();
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
    } = useForm<ZoneFormData>({
        resolver: zodResolver(zoneSchema),
        mode: 'all',
        reValidateMode: 'onChange',
        defaultValues: {
          name: defaultValues?.name || ''
        }
    });
    
    const handleSaveZone = async (data: ZoneFormData) => {
        let result;
        
        if (isEditing && defaultValues?.id) {
            result = await updateZone({
                zoneId: defaultValues.id,
                ...data
            });
        } else {
            result = await createZone({...data, company_id: company?.id});
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
                    ? "Zone updated successfully" 
                    : "Zone created successfully"
            });
            close?.();
        }
    };
    
    if (isLoading) return <Spinner />;
    
    return (
        <form className="grid gap-6" onSubmit={handleSubmit(handleSaveZone)}>
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
