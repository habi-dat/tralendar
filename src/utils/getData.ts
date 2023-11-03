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
};

type AdminApiService = {
  getBookings: (options: {
    date_from: string;
    date_to: string;
    is_confirmed?: number;
  }) => Booking[];
};

export const getData = unstable_cache(async (): Promise<EventSourceInput> => {
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
      date_from: moment().subtract(1, "month").format("YYYY-MM-DD"),
      date_to: moment().add(6, "months").format("YYYY-MM-DD"),
      is_confirmed: 1,
    });

    const mapped = eventList.map((event) => ({
      id: event.id,
      title: event.event,
      start: moment(event.start_date).format("YYYY-MM-DDTHH:mm:ss"),
      end: moment(event.end_date).format("YYYY-MM-DDTHH:mm:ss"),
    }));

    return mapped;
  }
  return [];
});
