export interface AccessProps {
    text: string
}

export const AccessConstComponent = (props: AccessProps) => {
    return <div className={`text-blue-500 bg-gray-800 w-fit pl-2 pr-2 p-1 text-xs rounded-2xl`}>
        {props.text}
    </div>
}
