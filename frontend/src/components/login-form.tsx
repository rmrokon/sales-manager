"use client"

import { cn, isRtkQueryError } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as z from "zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ErrorMessage } from "@/components/ui/error"
import { useLoginMutation } from "@/store/services/api.auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Spinner } from "./ui/spinner"

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().nonempty(),
});

type LoginType = z.infer<typeof LoginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [loginMutation, {isLoading}] = useLoginMutation();
  const {toast} = useToast();
  const router = useRouter();
  const {
          handleSubmit, 
          formState: {errors},
          register
      } = useForm<LoginType>({
          resolver: zodResolver(LoginSchema),
          reValidateMode: "onChange",
          mode: "all"
      })
      const onSubmit: SubmitHandler<LoginType> = async (data) => {
        const result = await loginMutation(data);
          if (isRtkQueryError(result) && result.error.data.success === false) {
            toast({
              variant: "destructive",
              description: `${result.error.data.message}`
            });
          } else {
            router.replace('/invoices');
          }
      };
  if(isLoading) return <Spinner />;
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="m@example.com"
                    {...register("email")}
                  />
                  {errors.email?.message && <ErrorMessage message={errors.email?.message} />}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password?.message && <ErrorMessage message={errors.password?.message} />}
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
