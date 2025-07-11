import { ArrowLeftIcon } from "../icons/arrowLeft"
import { ArrowRightIcon } from "../icons/arrowRight"
import { SearchIcon } from "../icons/SearchIcon"
import type { Room } from "../pages/DashboardPage"
import { ButtonComponent } from "./ButtonComponent"
import { RoomItemComponent } from "./RoomItem"

export interface SearchPanelProps {
    showSearch: boolean,
    setShowSearch: (value: boolean) => void,
    rooms: Room[]
}  

export const SearchResultPanelComponent = (props: SearchPanelProps) => {

    return <>
    <div className={`fixed right-0 top-0 h-screen duration-300 flex flex-col ease-in-out border-l border-gray-400
    ${props.showSearch ? "w-96" : "w-16"} bg-gray-900 text-white overflow-hidden transition-[width]`}>
    
        <div className={`flex flex-none justify-end p-2`}>
            <ButtonComponent
                text=""
                icon={props.showSearch ? <ArrowRightIcon size="md"/> : <ArrowLeftIcon size="md"/>}
                onClick={() => props.setShowSearch(!props.showSearch)}
                size="onlyIcon"
            />
        </div>

            <div className={`mb-3 flex flex-none ${props.showSearch ? "justify-center" : "justify-start ml-4"} items-center h-12`}>
                <div className={`flex items-center`}>
                    <SearchIcon size="lg"/>
                    <span className={`
                        ml-2
                        text-3xl
                        font-semibold
                        tracking-wide
                        whitespace-nowrap
                        transform transition-opacity transition-transform duration-300 ease-in-out
                        ${props.showSearch
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-4"
                        }
                        `}>
                        Search Result
                    </span>
                </div>
            </div>

            {props.showSearch && (
                    <div className={`bg-gray-900 flex-1 overflow-y-auto border-t border-gray-700 px-3 py-2 space-y-3`}>
                        {props.rooms.length === 0 ? (
                            <div className={`whitespace-nowrap text-gray-400 text-center pt-4`}>No matching room found.</div>
                        ) : (
                            props.rooms.map(room => (
                                <RoomItemComponent
                                    key={room.roomId}
                                    roomId={room.roomId}
                                    roomName={room.roomName}
                                    isPrivate={room.isPrivate}
                                    searchedRooms
                                />
                            ))
                        )}
                    </div>
            )}
    </div>
    </>
}