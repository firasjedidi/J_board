"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { supabase } from "@/lib/supabaseClient";
import { checkSubscription } from "@/lib/subscription";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { incrementAvailableCount, hasAvailableCount } from "@/lib/org-limit";

import { CreateBoard } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const canCreate = await hasAvailableCount();
  const isPro = await checkSubscription();

  if (!canCreate && !isPro) {
    return {
      error: "You have reached your limit of free boards. Please upgrade to create more."
    }
  }

  const { title,image  } = data;

  const [
    imageId,
    imageThumbUrl,
    imageFullUrl,
    imageLinkHtml,
    imageUserName
  ] = image.split("|");

  if (!imageId || !imageThumbUrl || !imageFullUrl || !imageUserName || !imageLinkHtml) {
    return {
      error: "Missing fields. Failed to create board."
    };
  }

  let board;
  
  try {
    const createBoard = await supabase
    .from('Board')
    .insert({
      title,
      orgId,
      imageId,
      imageThumbUrl,
      imageFullUrl,
      imageUserName,
      imageLinkHtml,
    })
    .select('*')
    .single();


    board = createBoard?.data;

    if (!isPro) {
     await incrementAvailableCount();
    }

    await createAuditLog({
      entityID: board.id,
      entityTitle: board.title,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.CREATE,
    });
    
    
  } catch (error) {
    return {
      error: "Failed to create."
    }
  }

  revalidatePath(`/board/${board?.id}`);
  return { data: board };
};

export const createBoard = createSafeAction(CreateBoard, handler);