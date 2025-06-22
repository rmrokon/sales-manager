'use client';
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/hooks/use-toast";
import { isRtkQueryError } from "@/lib/utils";
import { useCreateProductMutation, useUpdateProductMutation } from "@/store/services/product";
import { useGetProvidersQuery } from "@/store/services/provider";
import { IProduct } from "@/utils/types/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const productSchema = z.object({
    name: z.string().nonempty({ message: 'Product name is required' }),
    price: z.coerce.number().min(0, { message: 'Price must be a positive number' }),
    description: z.string().optional(),
    providerIds: z.array(z.string()).optional()
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<IProduct>;
  onSuccess?: () => void;
}

export default function ProductForm({ defaultValues, onSuccess }: ProductFormProps) {
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const { data: providersData, isLoading: isLoadingProviders } = useGetProvidersQuery({});
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    const { company } = useSelector((state: RootState) => state.auth);
    const { toast } = useToast();
    const router = useRouter();
    
    const isEditing = Boolean(defaultValues?.id);
    const isLoading = isCreating || isUpdating || isLoadingProviders;
    
    const {
        handleSubmit,
        register,
        control,
        formState: { errors }
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        mode: 'all',
        reValidateMode: 'onChange',
        defaultValues: {
          name: defaultValues?.name || '',
          price: defaultValues?.price || 0,
          description: defaultValues?.description || '',
          providerIds: []
        }
    });
    
    // Load initial provider selections if editing
    useEffect(() => {
        if (isEditing && defaultValues?.providers) {
            const providerIds = defaultValues.providers.map(provider => provider.id);
            setSelectedProviders(providerIds);
        }
    }, [isEditing, defaultValues]);
    
    const providerOptions = providersData?.result.map(provider => ({
        label: provider.name,
        value: provider.id
    })) || [];
    
    const handleSaveProduct = async (data: ProductFormData) => {
        let result;
        
        try {
            const productData = {
                ...data,
                providerIds: selectedProviders,
                company_id: company?.id
            };
            
            if (isEditing && defaultValues?.id) {
                result = await updateProduct({
                    productId: defaultValues.id,
                    ...productData
                });
            } else {
                result = await createProduct(productData);
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
                        ? "Product updated successfully" 
                        : "Product created successfully"
                });
                // Ensure onSuccess is called after the state updates are processed
                setTimeout(() => {
                    onSuccess?.();
                }, 0);
            }
        } catch (error) {
            toast({
                variant: "destructive",
                description: "An error occurred"
            });
        }
    };
    
    if (isLoading) return <h3>Loading...</h3>;
    console.log({selectedProviders})
    return (
        <form className="grid gap-6" onSubmit={handleSubmit(handleSaveProduct)}>
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    {...register("name")}
                />
                {errors.name?.message && <ErrorMessage message={errors.name?.message} />}
            </div>
            
            <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price")}
                />
                {errors.price?.message && <ErrorMessage message={errors.price?.message} />}
            </div>
            
            <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    {...register("description")}
                />
                {errors.description?.message && <ErrorMessage message={errors.description?.message} />}
            </div>
            
            <div className="grid gap-2">
                <Label htmlFor="providers">Providers</Label>
                <Controller
                    name="providerIds"
                    control={control}
                    render={({ field }) => (
                        <MultiSelect
                            options={providerOptions}
                            selected={selectedProviders}
                            onChange={(selected) => {
                                setSelectedProviders(selected);
                                field.onChange(selected);
                            }}
                            placeholder="Select providers..."
                        />
                    )}
                />
                {errors.providerIds?.message && <ErrorMessage message={errors.providerIds?.message} />}
            </div>
            
            <Button>{isEditing ? 'Update' : 'Create'}</Button>
        </form>
    );
}
