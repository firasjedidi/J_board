"use server";

import { auth, currentUser } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabaseClient";
import { createSafeAction } from "@/lib/create-safe-action";

import { StripeRedirect } from "./schema";
import { InputType, ReturnType } from "./types";

import { absoluteUrl } from "@/lib/utils";
import { stripe } from "@/lib/stripe";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!userId || !orgId || !user) {
    return {
      error: "Unauthorized",
    };
  }

  const settingsUrl = absoluteUrl(`/organization/${orgId}`);

  let url = "";

  try {
    // Fetch the orgSubscription using Supabase
    const { data: orgSubscription,error } = await supabase
    .from('OrgSubscription')
    .select('stripeCustomerId')
    .eq('orgId', orgId)
    .maybeSingle();

    // If an existing subscription is found, create a Stripe billing portal session
    if (orgSubscription !== null && orgSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: orgSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      url = stripeSession.url;
    } else {

      // If no subscription, create a new Stripe checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: user.emailAddresses[0].emailAddress,
        line_items: [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: "Taskify Pro",
                description: "Unlimited boards for your organization",
              },
              unit_amount: 2000, // $20
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          orgId,
        },
      });

      url = stripeSession.url || '';  
    }

  } catch {
    return {
      error: "Something went wrong!"
    }
  };

  revalidatePath(`/organization/${orgId}`);
  return { data: url };
};

export const stripeRedirect = createSafeAction(StripeRedirect, handler);