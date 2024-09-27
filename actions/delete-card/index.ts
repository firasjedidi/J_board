"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { supabase } from "@/lib/supabaseClient";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { DeleteCard } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }

  const { id, boardId } = data;

  let Card;

  try {
    const { data: card } = await supabase
    .from("Card")
    .select(
      `
        *,
        List!inner (
          Board!inner (
            orgId
          )
        )
      `
    )
    .eq("id", id)
    .single();

  // Step 2: Check if the card belongs to the correct orgId
  const isAuthorized = card.List?.Board?.orgId === orgId;

  if (!isAuthorized) {
    return { error: "Failed to update." };
  }

  // Step 3: Perform the update
  const { data } = await supabase
  .from("Card")
  .delete()
  .eq("id", id)
  .select("*")
  .single();

  Card = data;

  await createAuditLog({
    entityID: card.id,
    entityTitle: card.title,
    entityType: ENTITY_TYPE.CARD,
    action: ACTION.DELETE,
  });
  } catch (error) {
    return {
      error: "Failed to delete.",
    };
  }

  revalidatePath(`/board/${boardId}`);
  
  return {
    data:Card
  }
};

export const deleteCard = createSafeAction(DeleteCard,handler)

