import { auth } from "@clerk/nextjs";

import { supabase } from "./supabaseClient";
const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const { orgId } = auth();

  if (!orgId) {
    return false;
  }

  // Fetch the orgSubscription using Supabase
  const { data: orgSubscription } = await supabase
  .from('OrgSubscription')
  .select(`
    stripePriceId,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeCurrentPeriodEnd
  `)
  .eq('orgId', orgId)
  .single();  // Ensures only one result is returned

  if (!orgSubscription) {
    return false;
  }
  
// Convert stripeCurrentPeriodEnd to a Date object if it's not already one
  const stripeCurrentPeriodEndDate = new Date(orgSubscription.stripeCurrentPeriodEnd);

  const isValid =
  orgSubscription.stripePriceId &&
  stripeCurrentPeriodEndDate.getTime() + DAY_IN_MS > Date.now();

  return !!isValid;
};
