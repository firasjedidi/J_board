import { supabase } from "@/lib/supabaseClient";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
      return new NextResponse("Unautherized", { status: 401 });
    }

    const { data: card } = await supabase
      .from("Card")
      .select(
        ` 
          *,
          List!inner (
            title,
            Board!inner (
              orgId
            )
          )
        `
      )
      .eq("id", params.cardId)
      .single();

    const result = {
      ...card,
      list: {
        title: card?.List?.title,
        orgId: card?.List?.Board?.orgId,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
