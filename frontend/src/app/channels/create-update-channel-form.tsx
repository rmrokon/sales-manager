'use client';
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isRtkQueryError } from "@/lib/utils";
import { useCreateChannelMutation, useUpdateChannelMutation } from "@/store/services/channel";
import { IChannel } from "@/utils/types/channel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const channelSchema = z.object({
    name: z.string().nonempty({ message: 'Channel name is required' })
});

type ICreateUpdateChannel = z.infer<typeof channelSchema>;

export default function CreateUpdateChannelForm({defaultValues}: {defaultValues?: Partial<IChannel>}) {
    const [channelMutation, { isError, isLoading }] = useCreateChannelMutation();
    const [channelUpdateMutation, { isError: updateErrod, isLoading: updateLoading }] = useUpdateChannelMutation();
    const { toast } = useToast();
    
    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<ICreateUpdateChannel>({
        resolver: zodResolver(channelSchema),
        defaultValues: {
            name: defaultValues?.name || ''
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange'
    });
    const handleCreateUpdateChannel = async (data: ICreateUpdateChannel) => {
        let result;
        if (defaultValues?.id) {
            result = await channelUpdateMutation({ ...data, id: defaultValues?.id });
        } else {
            result = await channelMutation(data);
        }
        if (isRtkQueryError(result) && result.error.data.success === false) {
            toast({
                variant: "destructive",
                description: `${result.error.data.message}`
            });
        } else {
            toast({
                variant: "default",
                description: defaultValues?.id ? 'Channel updated successfully' : 'Channel created successfully'
            });
        }
    };
    return <form className="grid gap-6" onSubmit={handleSubmit(handleCreateUpdateChannel)}>
        <div className="grid gap-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
                id="name"
                {...register("name")}
            />
        </div>
        {errors.name?.message && <ErrorMessage message={errors.name?.message} />}
        <Button>{defaultValues?.id ? 'Update' : 'Create'}</Button>
    </form>
}