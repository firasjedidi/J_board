import { checkSubscription } from "@/lib/subscription";

import { Separator } from "@/components/ui/separator";

import { Info } from "../_components/info";
import { SubscriptionButton } from "./_components/subsription-button";


const Billing  = async () => {
    const isPro = await checkSubscription();

    return(
        <div className="w-full">
            <Info isPro={isPro}/>
            <Separator className="my-2"/>
            <SubscriptionButton
                isPro={isPro}
            />

        </div>
    )
}

export default Billing;