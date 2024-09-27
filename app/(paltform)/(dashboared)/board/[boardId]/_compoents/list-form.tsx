"use client";

import { Plus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ElementRef, useRef, useState } from "react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useAction } from "@/hooks/use-action";
import { createList } from "@/actions/create-list";

import { ListWrapper } from "./list-wrapper";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/form-input";
import { FormButton } from "@/components/form/form-button";
import { toast } from "sonner";

export const ListForm = () => {
  const router = useRouter();
  const params = useParams();

  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const [isEditing, setIsEditing] = useState(false);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef?.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const { execute, fieldErrors } = useAction(createList, {
    onError(error) {
      toast.error(error);
    },
    onSuccess(data) {
      toast.success(`List "${data.title}" created`);
      disableEditing();
      router.refresh();
    },
  });

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const boardId = formData.get("boardId") as string;
    execute({ title, boardId });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);
  if (isEditing) {
    return (
      <ListWrapper>
        <form
          action={onSubmit}
          ref={formRef}
          className="w-full p-3 rounded-md bg-white space-y-4 shadow-md"
        >
          <FormInput
            ref={inputRef}
            errors={fieldErrors}
            id="title"
            className="text-sm px-2 py-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition"
            palceholder="Enter list title..."
          />
          <input hidden defaultValue={params.boardId} name="boardId" />
          <div className="flex items-center gap-x-1">
            <FormButton className="text-white">Add list</FormButton>
            <Button onClick={disableEditing} size="sm" variant="ghost">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </ListWrapper>
    );
  }

  return (
    <ListWrapper>
      <Button
        onClick={enableEditing}
        className="w-full ronuded-md bg-white/50 hover:bg-white/50 transition p-3 flex items-center font-medium text-black text-sm "
      >
        <Plus className="h-4 w-4 mr-2" />
        Add a list
      </Button>
    </ListWrapper>
  );
};
