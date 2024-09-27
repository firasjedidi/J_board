"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import { useAction } from "@/hooks/use-action";
import { updateListOrder } from "@/actions/update-list-order";
import { updateCardOrder } from "@/actions/update-card-order ";
import { ListWithCards } from "@/types";

import { ListForm } from "./list-form";
import { ListItem } from "./list-item";

interface ListContainerProps {
  boardId: string;
  data: ListWithCards[];
}
function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
export const ListContainer = ({ boardId, data }: ListContainerProps) => {
  const [orderData, setOrderData] = useState(data);

  useEffect(() => {
    setOrderData(data);
  }, [data]);

  const { execute: excuteListReorder } = useAction(updateListOrder, {
    onSuccess() {
      toast.success(`List reordered`);
    },
    onError(error) {
      toast.error(error);
    },
  });

  const { execute: excuteCardReorder ,fieldErrors} = useAction(updateCardOrder, {
    onSuccess() {
      toast.success(`Card reordered`);
    },
    onError(error) {
      toast.error(error);
    },
  });
  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    // if dropped in the same pos
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // user drag a list
    if (type === "list") {
      const items = reorder(orderData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index, id: item.id.toString() })
      );
      setOrderData(items);
      excuteListReorder({ items, boardId });
    }

    // user drag a card
    if (type === "card") {
      let newOrderedData = [...orderData];

      // source and destination list
      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId
      );
      const destList = newOrderedData.find(
        (list) => list.id === destination.droppableId
      );
      if (!sourceList || !destList) {
        return;
      }

      // check if cards exists  on the sourceList
      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      // check if cards exists  on the destList
      if (!destList.cards) {
        destList.cards = [];
      }

      // moving the cards in same list
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index,
        );
        
        reorderedCards.forEach((card, index) => {
          card.order = index;
          card.id = card.id.toString();
          card.listId = card.listId.toString();
        });

        sourceList.cards = reorderedCards;
        
        setOrderData(newOrderedData);
        excuteCardReorder({items:reorderedCards,boardId})
    } else {
        // moving the cards in other list
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        // assign the new listId to the moved card
        movedCard.listId = destination.droppableId;

        // add the card to the destination list
        destList.cards.splice(destination.index, 0, movedCard);

        // update the order for each card in the destination list
        destList.cards.forEach((card, index) => {
          card.order = index;
          card.id = card.id.toString();
          card.listId = card.listId.toString();
        });

        setOrderData(newOrderedData);
        excuteCardReorder({items:destList.cards,boardId})
      }
    }
  };
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provider) => (
          <ol
            {...provider.droppableProps}
            ref={provider.innerRef}
            className="flex gap-x-3 h-full"
          >
            {orderData.map((list, index) => {
              return <ListItem key={list.id} index={index} data={list} draggableId={String(list.id)} />;
            })}
            <ListForm />
            {provider.placeholder}
            <div className="flex-shrink-0 w-1" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
