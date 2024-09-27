// Enums
export enum ACTION {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE"
  }
  
  export enum ENTITY_TYPE {
    BOARD = "BOARD",
    LIST = "LIST",
    CARD = "CARD"
  }
  
  // Interfaces for models
  export interface Board {
    id: string;
    orgId: string;
    title: string;
    imageId: string;
    imageThumbUrl: string;
    imageFullUrl: string;
    imageUserName: string;
    imageLinkHtml: string;
    lists: List[]; // Relation field
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface List {
    id: string;
    title: string;
    order: number;
    boardId: string;
    board: Board; // Relation field
    cards: Card[]; // Relation field
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Card {
    id: string;
    title: string;
    order: number;
    description?: string;
    listId: string;
    list: List; // Relation field
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Auditlog {
    id: string;
    orgId: string;
    action: ACTION;
    entityID: string;
    entityType: ENTITY_TYPE;
    entityTitle: string;
    userId: string;
    userImage: string;
    userName: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface OrgLimit {
    id: string;
    orgId: string;
    count: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface OrgSubscription {
    id: string;
    orgId: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    stripeCurrentPeriodEnd?: Date;
  }
  