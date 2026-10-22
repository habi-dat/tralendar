import type { EventSourceInput } from "@fullcalendar/core";
import moment from "moment";
import { unstable_cache } from "next/cache";
import { rpcClient } from "typed-rpc";

export const dynamic = "force-dynamic";
export const revalidate = 60;
export const maxDuration = 5;

type LoginService = {
  getToken: (companyLogin: string, apiKey: string) => string;
  getUserToken: (
    companLogin: string,
    username: string,
    password: string,
  ) => string;
};

type PublicApiService = {
  getEventList: (
    isVisibleOnly: boolean,
    asArray: boolean,
    handleClasses: number | null,
    searchString: string | null,
  ) => unknown;
};

type Booking = {
  id: string;
  start_date: string;
  end_date: string;
  event: string;
  event_category: string | null;
  invoice_id: string;
  is_confirm: string;
  client: string;
};

type AdminApiService = {
  getBookings: (options: { date_from: string; date_to: string }) => Booking[];
};

const getClassName = (category: string) => {
  if (category === "4" || category === "6" || category === "1") {
    return "event-red";
  }
  if (category === "2") return "event-green";
  return "event-blue";
};

export const getData = unstable_cache(
  async (): Promise<EventSourceInput> => {
    //const res = await fetch("https://api.example.com/...");
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    /*  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  } */

    const loginService = rpcClient<LoginService>(
      "https://user-api.simplybook.me/login",
    );
    if (process.env.SIMPLYBOOK_USER && process.env.SIMPLYBOOK_PASSWORD) {
      const token = await loginService.getUserToken(
        "circustrap",
        process.env.SIMPLYBOOK_USER || "",
        process.env.SIMPLYBOOK_PASSWORD || "",
      );

      const apiService = rpcClient<AdminApiService>({
        url: "https://user-api.simplybook.me/admin",
        getHeaders() {
          return { "X-Company-Login": "circustrap", "X-User-Token": token };
        },
      });

      const eventList = await apiService.getBookings({
        date_from: moment().subtract(10, "month").format("YYYY-MM-DD"),
        date_to: moment().add(12, "months").format("YYYY-MM-DD"),
      });

      console.log(eventList);

      const mapped: EventSourceInput = eventList
        .filter((event) => event.is_confirm === "1")
        .map((event) => ({
          id: event.id,
          title:
            event.client === "Reserved for Open Training"
              ? `${event.event} reserved for Open Training`
              : event.event,
          start: moment(event.start_date).format("YYYY-MM-DDTHH:mm:ss"),
          end: moment(event.end_date).format("YYYY-MM-DDTHH:mm:ss"),
          classNames: [getClassName(event.event_category || "1")],
        }));

      return mapped;
    }
    return [];
  },
  [],
  { revalidate: 60 },
);
