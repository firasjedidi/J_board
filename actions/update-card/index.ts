"use server";

import { auth } from "@clerk/nextjs";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { supabase } from "@/lib/supabaseClient";

import { UpdateCard } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }

  const { id, boardId, ...values } = data;
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
    .update(values)
    .eq("id", id)
    .select("*")
    .single();

    Card = data;
    
    await createAuditLog({
      entityID: Card.id,
      entityTitle: Card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
    });
  } catch (error) {
    return {
      error: "Failed to update.",
    };
  }
  revalidatePath(`/board/${boardId}`);
  return {
    data: Card,
  };
};

export const updateCard = createSafeAction(UpdateCard, handler);
