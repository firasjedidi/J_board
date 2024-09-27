import { auth, currentUser } from "@clerk/nextjs";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { supabase } from "./supabaseClient";
interface Props {
  entityID: string;
  entityType: ENTITY_TYPE;
  entityTitle: string;
  action: ACTION;
}

export const createAuditLog = async (props: Props) => {
  try {
    const { orgId } = auth();
    const user = await currentUser();
    
    if (!user || !orgId) {
      throw new Error("User not found!");
    }

    const { entityID, entityTitle, entityType, action } = props;
    
    await supabase
    .from('Auditlog')
    .insert({
      orgId,
      entityID,
      entityType,
      entityTitle,
      action,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userImage: user.imageUrl,
    });
    
  } catch (error) {
    console.log("audit-log-error", error);
  }
};
