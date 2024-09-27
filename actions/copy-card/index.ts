"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { supabase } from "@/lib/supabaseClient";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/create-audit-log";

import { CopyCard } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }

  const { id, boardId } = data;

  let card;

  try {
    // Step 1: Fetch the Card with related List and Board
    const { data: cardToCopy } = await supabase
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

    // Step 2: Verify that the card belongs to the correct orgId
    const isAuthorized = cardToCopy.List?.Board?.orgId === orgId;

    if (!isAuthorized) {
      return { error: "Failed to copy." };
    }
    // Step 3: Check if a copy of this card already exists
    const copyTitle = cardToCopy.title.includes("-Copy") ?`${cardToCopy.title}`:`${cardToCopy.title}`;
    const { data: existingCopy } = await supabase
      .from("Card")
      .select("id")
      .eq("title", copyTitle)
      .eq("listId", cardToCopy.listId)
      .single();

    if (existingCopy) {
      return { error: "A copy of this card already exists." };
    }

    // Step 4: Find the last card in the list to determine the new order
    const { data: lastCard } = await supabase
      .from("Card")
      .select("order")
      .eq("listId", cardToCopy.listId)
      .order("order", { ascending: false }) // Get the card with the highest order
      .limit(1)
      .single();

    const newOrder = lastCard ? lastCard.order + 1 : 1;

    // Step 5: Create the new copied card
    const { data: newCard } = await supabase
      .from("Card")
      .insert({
        title: `${cardToCopy.title}-Copy`,
        description: cardToCopy.description,
        order: newOrder,
        listId: cardToCopy.listId,
      })
      .select()
      .single();

    card = newCard;

    await createAuditLog({
      entityID: card.id,
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.CREATE,
    });
  } catch (error) {
    return {
      error: "Failed to copy.",
    };
  }

  revalidatePath(`/board/${boardId}`);

  return {
    data: card,
  };
};

export const copyCard = createSafeAction(CopyCard, handler);
