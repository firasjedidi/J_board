"use client";
import { toast } from "sonner";

import { useAction } from "@/hooks/use-action";
import { useProModal } from "@/hooks/use-pro-modal";
import { stripeRedirect } from "@/actions/stripe-redirect";

import { Button } from "@/components/ui/button";

interface SubscriptionButtonProps {
    isPro: boolean;
}

export const SubscriptionButton = ({isPro}:SubscriptionButtonProps) => {
    const proModal = useProModal();

    const { execute, isLoading} = useAction(stripeRedirect,{
        onSuccess(data) {
            window.location.href = data;
        },
        onError(error) {
            toast.error(error)
        },
    });

    const onClick = () => {
        if (isPro) {
            execute({});
        }else{
            proModal.onOpen();
        }
    }
    return (
        <Button className="text-white" variant="primary" disabled={isLoading} onClick={onClick}>
            {isPro ? "Manage subscription" : "Upgrade to pro"}
        </Button>
    )
}