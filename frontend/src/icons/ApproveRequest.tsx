import { iconSizeVariants, type IconProps } from "."

export const ApproveRequestIcon = (props: IconProps) => {
    return <div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
        className={iconSizeVariants[props.size]}>
        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    </div>
}