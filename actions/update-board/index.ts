"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { supabase } from "@/lib/supabaseClient";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateBoard } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }

  const { title, id } = data;

  let board;

  try {
    const updateBoard = await supabase
    .from('Board')
    .update({ title })
    .eq('id', id)
    .eq('orgId', orgId)
    .select("*")
    .single();
  
    board = updateBoard.data;

    await createAuditLog({
      entityID: board.id,
      entityTitle: board.title,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.UPDATE,
    });
  } catch (error) {
    return {
      error: "Failed to update.",
    };
  }
  revalidatePath(`/board/${id}`);
  return {
    data:board
  }
};

export const updateBoard = createSafeAction(UpdateBoard,handler)

