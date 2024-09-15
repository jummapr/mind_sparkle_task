"use client"

import { useActivateAccountMutation } from '@/redux/features/auth/authApi';
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';

const VerificationPage = () => {
    const {id} = useParams();
    const {push} = useRouter();
    const [activateAccount, { isLoading, isSuccess }] = useActivateAccountMutation();

    const handleActivateAccount = () => {
        activateAccount(id);
    }

    useEffect(() => {
        if(isSuccess) {
            push('/login');
            toast({
                title: "Account activated",
                description:
                  "account activated successfully",
              });
        }
    },[isSuccess])
  return (
    <div className='container mx-auto flex min-h-screen items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl'>
        <h1 className='text-3xl font-bold'>Activation</h1>
        <Button onClick={() => handleActivateAccount()}>Activate Account</Button>
      </div>
    </div>
  )
}

export default VerificationPage
