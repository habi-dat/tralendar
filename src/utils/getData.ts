import moment from "moment";
import { rpcClient } from "typed-rpc";

import { EventSourceInput } from "@fullcalendar/core";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 60;
export const maxDuration = 5;

type LoginService = {
  getToken: (companyLogin: string, apiKey: string) => string;
  getUserToken: (
    companLogin: string,
    username: string,
    password: string
  ) => string;
};

type PublicApiService = {
  getEventList: (
    isVisibleOnly: Boolean,
    asArray: Boolean,
    handleClasses: number | null,
    searchString: string | null
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
};

type AdminApiService = {
  getBookings: (options: { date_from: string; date_to: string }) => Booking[];
};

const getColor = (category: string) => {
  let color;
  if (category === "1") {
    color = "#dc0504";
  } else if (category === "2") {
    color = "#239c63";
  } else if (category === "3") {
    color = undefined;
  }
  return color;
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
      "https://user-api.simplybook.me/login"
    );
    if (process.env.SIMPLYBOOK_USER && process.env.SIMPLYBOOK_PASSWORD) {
      const token = await loginService.getUserToken(
        "circustrap",
        process.env.SIMPLYBOOK_USER || "",
        process.env.SIMPLYBOOK_PASSWORD || ""
      );

      const apiService = rpcClient<AdminApiService>({
        url: "https://user-api.simplybook.me/admin",
        getHeaders() {
          return { "X-Company-Login": "circustrap", "X-User-Token": token };
        },
      });

      const eventList = await apiService.getBookings({
        date_from: moment().subtract(10, "month").format("YYYY-MM-DD"),
        date_to: moment().add(6, "months").format("YYYY-MM-DD"),
      });

      const mapped: EventSourceInput = eventList
        .filter((event) => event.is_confirm === "1")
        .map((event) => ({
          id: event.id,
          title: event.event,
          start: moment(event.start_date).format("YYYY-MM-DDTHH:mm:ss"),
          end: moment(event.end_date).format("YYYY-MM-DDTHH:mm:ss"),
          backgroundColor: getColor(event.event_category || "1"),
          borderColor: getColor(event.event_category || "1"),
        }));

      return mapped;
    }
    return [];
  },
  [],
  { revalidate: 60 }
);
