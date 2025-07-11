import type { ReactElement } from "react";

export interface ButtonProps {
    text: string;
    size?: "sm" | "lg" | "default" | "onlyIcon" | "upVote" | string;
    onClick?: () => void
    icon?: ReactElement
    variant?: string
}

export const ButtonComponent = (props: ButtonProps) => {
    const defaultSize = "p-2 w-32 rounded";
    const smSize = " p-0.5 w-24 text-xs rounded-sm font-normal rounded"
    const lgSize = "p-2 w-48 rounded"
    const upvoteSize = "rounded"
    return <button 
    type={"submit"}
    onClick={props.onClick}
    className={`${props.variant === "active" ? "bg-red-600 hover:bg-red-600" : "bg-blue-500"} hover:bg-blue-600 text-white 
        ${props.size === "sm" ? smSize : props.size === "lg" ? lgSize : props.size === "onlyIcon" ? "pl-2 py-1 rounded" 
            : props.size === "upVote" ? upvoteSize : defaultSize } 
    font-semibold cursor-pointer flex justify-center items-center`}>
        {props.icon &&
            <div className={props.size === "upVote" ? "" : "mr-2"}>
                {props.icon}
            </div>
        }
        <div className={``}>
            {props.text}
        </div>
    </button>
}