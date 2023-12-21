"use client";
import React from "react";
import FullCalendar from "@fullcalendar/react";
import { EventSourceInput } from "@fullcalendar/core";
import timeGridPlugin from "@fullcalendar/timegrid"; // a plugin!
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import moment from "moment";

type Props = {
  events: EventSourceInput;
};

export const Tralendar = ({ events }: Props): JSX.Element => {
  return (
    <div>
      <FullCalendar
        plugins={[timeGridPlugin, bootstrap5Plugin]}
        initialView="timeGridWeek"
        themeSystem="bootstrap5"
        initialEvents={events}
        titleFormat={{
          hour12: false,
          month: "short",
          day: "2-digit",
          year: "numeric",
        }}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        dayHeaderFormat={{ weekday: "short", day: "numeric", month: "short" }}
        slotLabelFormat={{ hour12: false, hour: "2-digit", minute: "2-digit" }}
        slotDuration="01:00"
        slotMinTime="06:00"
        slotMaxTime="24:00"
        locale="en"
        height="600px"
      />
    </div>
  );
};
