import type React from "react";

export interface InputProps {
    text: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
}

export const InputComponent = (props: InputProps) => {
    return <div>
        <input type="text" 
        placeholder={props.text} 
        value={props.value}
        onChange={props.onChange}
        className={`bg-gray-900 text-white placeholder-gray-400 p-2 rounded border border-gray-400 outline-none w-80`}/>
    </div>
}