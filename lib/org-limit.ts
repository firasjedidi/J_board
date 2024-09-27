import { auth } from "@clerk/nextjs";

import { MAX_FREE_BOARDS } from "@/constants/boards";
import { supabase } from "./supabaseClient";

export const incrementAvailableCount = async () => {
    const { orgId } = auth();
  
    if (!orgId) {
      throw new Error("Unauthorized");
    }
  
    const { data: orgLimit } = await supabase
    .from('orgLimit')
    .select('count')
    .eq('orgId', orgId)
    .single();
  
    if (orgLimit) {
      await supabase
        .from('orgLimit')
        .update({ count: orgLimit.count + 1 })
        .eq('orgId', orgId);
    } else {
      await supabase
        .from('orgLimit')
        .insert({ orgId, count: 1 });
    }
};
  

export const decreaseAvailableCount = async () => {
    const { orgId } = auth();
  
    if (!orgId) {
      throw new Error("Unauthorized");
    }
  
    const { data: orgLimit } = await supabase
    .from('orgLimit')
    .select('count')
    .eq('orgId', orgId)
    .single();
  
    if (orgLimit) {
      const newCount = orgLimit.count > 0 ? orgLimit.count - 1 : 0;
      await supabase
        .from('orgLimit')
        .update({ count: newCount })
        .eq('orgId', orgId);
    } else {
      await supabase
        .from('orgLimit')
        .insert({ orgId, count: 1 });
    }
};
  

export const hasAvailableCount = async () => {
    const { orgId } = auth();
  
    if (!orgId) {
      throw new Error("Unauthorized");
    }
  
    const { data: orgLimit } = await supabase
    .from('orgLimit')
    .select('count')
    .eq('orgId', orgId)
    .single();
  
  
    return !orgLimit || orgLimit.count < MAX_FREE_BOARDS;
};
  

export const getAvailableCount = async () => {
    const { orgId } = auth();
  
    if (!orgId) {
      return 0;
    }
  
    const { data: orgLimit } = await supabase
    .from('orgLimit')
    .select('count')
    .eq('orgId', orgId)
    .single();
  
    if (!orgLimit) {
      return 0;
    }
  
    return orgLimit.count;  
};
  