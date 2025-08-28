import { getDateHere } from "./getDateHeader";

export function groupMessagesByDate <T extends {createdAt: string | Date}> (messages: T[]) {
    const grouped: Record<string, T[]> = {};

    messages.forEach((msg) => {
        const date = new Date(msg.createdAt);
        const header = getDateHere(date);

        if(!grouped[header]){
            grouped[header] = [];
        }

        grouped[header].push(msg);
    });

    return Object.entries(grouped).map(([dateHeader, messages]) => ({
        dateHeader,
        messages,
    }));
}