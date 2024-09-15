"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Checkbox } from "./ui/checkbox";
import ReCAPTCHA from "react-google-recaptcha";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useRegisterMutation,
  useVerifyCaptchaMutation,
} from "@/redux/features/auth/authApi";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  country: z.string().optional(),
  phone_number: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[0-9]/, "Password must contain at least one numeric digit")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
});

const RegisterPage = () => {
  const recaptcha = useRef();
  const [captchaCompleted, setCaptchaCompleted] = useState(false);

  const [verifyCaptcha, { isLoading, isSuccess }] = useVerifyCaptchaMutation();
  const [
    register,
    {
      isLoading: isRegisterLoading,
      isSuccess: isRegisterSuccess,
      isError,
      data,
    },
  ] = useRegisterMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      country: "",
      phone_number: "",
      password: "",
    },
  });

  const verifyCaptchaHandler = (value: string) => {
    // @ts-ignore
    const captchaValue = recaptcha?.current?.getValue();
    const captchData = {
      captchaToken: captchaValue,
    };
    verifyCaptcha(captchData);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // @ts-ignore
    if (captchaCompleted) {
      const registerData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        country: values.country,
        phone_number: values.phone_number,
        password: values.password,
      };
      register(registerData);
      form.reset();
    } else {
      toast({
        title: "Captcha Verification Failed",
        description: "Please try again",
      });
    }
    setCaptchaCompleted(false);
  }

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Something went wrong",
      });
    }
    if (isRegisterSuccess) {
      toast({
        title: "Account verification mail sent",
        description:
          "If an account exists for this email, you will receive account verification mail.",
      });
    }
  }, [isError, isRegisterSuccess]);
  useEffect(() => {
    if (isSuccess) {
      setCaptchaCompleted(true);
    }
  }, [isSuccess]);

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to get started
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="captcha">Captcha</Label>
              <div className="bg-gray-200 p-4 rounded-md flex items-center justify-center">
                {/* @ts-ignore */}
                <ReCAPTCHA
                  // @ts-ignore
                  ref={recaptcha}
                  sitekey={process.env.NEXT_PUBLIC_SITE_KEY!}
                  onChange={verifyCaptchaHandler}
                />
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
