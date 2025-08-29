import { isToday, isYesterday } from "date-fns";

export function getDateHere (date:any) {
    if(isToday(date)) return "Today";
    if(isYesterday(date)) return "Yesterday";
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}