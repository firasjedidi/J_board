import { supabase } from "@/lib/supabaseClient";
import { ENTITY_TYPE } from "@/lib/types";
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

    const { data: auditlogs,error } = await supabase
    .from('Auditlog')
    .select('*')
    .eq('orgId', orgId)
    .eq('entityID', params.cardId)
    .eq('entityType', ENTITY_TYPE.CARD)
    .order('createdAt', { ascending: false })
    .limit(3);  

    return NextResponse.json(auditlogs);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}