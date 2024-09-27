"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { supabase } from "@/lib/supabaseClient";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateList } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }

  const { title, id, boardId } = data;

  let list;

  try {
    const { data: List } = await supabase
      .from("List")
      .select(
        `
          id,
          boardId,
          Board (
            orgId
          )
        `
      )
      .eq("id", id)
      .single();

    const isAuthorized = List.Board?.orgId === orgId;

    if (!isAuthorized) {
      return { error: "Unauthorized or invalid organization" };
    }

    // Step 2: Perform the update on the List
    const { data: updatedList } = await supabase
    .from("List")
    .update({ title })
    .eq("id", id)
    .eq("boardId", boardId)
    .select()
    .single();

    list = updatedList;

    await createAuditLog({
      entityID: list.id,
      entityTitle: list.title,
      entityType: ENTITY_TYPE.LIST,
      action: ACTION.UPDATE,
    });
  } catch (error) {
    return {
      error: "Failed to update.",
    };
  }
  revalidatePath(`/board/${id}`);
  return {
    data: list,
  };
};

export const updateList = createSafeAction(UpdateList, handler);
