"use client";

import { Board } from "@prisma/client";
import { ElementRef, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/form-input";
import { updateBoard } from "@/actions/update-board";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";

interface BoardTitleForm {
  data: Board;
}

export const BoardTitleForm = ({ data }: BoardTitleForm) => {
  const { execute, fieldErrors } = useAction(updateBoard, {
    onSuccess(data) {
      toast.success(`board "${data.title}" updated!`);
      setTitle(data.title);
      disableEditing();
    },
  });
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(data.title);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef?.current?.focus();
      inputRef?.current?.select();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onSubmit = (formdata: FormData) => {
    const title = formdata.get("title") as string;
    if (title === data.title) {
      return;
    }
    execute({ title, id: JSON.stringify(data.id) });
  };
  
  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  if (isEditing) {
    return (
      <form
        action={onSubmit}
        ref={formRef}
        className="flex items-center gap-x-2"
      >
        <FormInput
          ref={inputRef}
          id="title"
          onBlur={onBlur}
          defaultValue={title}
          className="text-lg font-bold px-2 py-1 h-7 bg-transparent focus-visible:outline-none focus-visible:ring-transparent border-none"
        />
      </form>
    );
  }

  return (
    <Button
      onClick={enableEditing}
      className="font-bold text-lg h-auto w-auto p-1 px-2"
      variant="transparent"
    >
      {title} 
    </Button>
  );
};
