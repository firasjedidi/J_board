import { XCircle } from "lucide-react";

interface FormErrosProps {
    id:string;
    errors?: Record<string, string[] | undefined>;
}

export const FormErrors = ({id,errors}:FormErrosProps) =>{
    if (!errors) return null;

    return(
        <div id={`${id}-error`}>
            {errors?.[id]?.map((error:string)=>(
                <div key={error} className="flex items-center font-medium p-2 border border-rose-500 bg-rose-500/50 rounded-sm">
                    <XCircle className="h-4 w-4 mr-2"/>
                    {error}
                </div>
            ))}
        </div>
    )
}