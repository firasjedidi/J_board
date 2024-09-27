"use server";

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { supabase } from "@/lib/supabaseClient";
import { checkSubscription } from "@/lib/subscription";
import { createAuditLog } from "@/lib/create-audit-log";
import { decreaseAvailableCount } from "@/lib/org-limit";
import { createSafeAction } from "@/lib/create-safe-action";

import { DeleteBoard } from "./schema";
import { InputType, ReturnType } from "./types";
const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }
  const isPro = await checkSubscription();

  const { id } = data;
  let board;

  try {
    const deletedBoard = await supabase
    .from('Board')
    .delete()
    .eq('id', id)
    .eq('orgId', orgId)
    .select("*")
    .single();
    
    board = deletedBoard?.data
    
    if (!isPro) {
      await decreaseAvailableCount();
    }

    await createAuditLog({
      entityID: board.id,
      entityTitle: board.title,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.DELETE,
    });
  } catch (error) {
    return {
      error: "Failed to delete.",
    };
  }
  revalidatePath(`/organization/${orgId}`);
  redirect(`/organization/${orgId}`);

};

export const deleteBoard = createSafeAction(DeleteBoard,handler)

