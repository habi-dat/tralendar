"use client";
import type { EventSourceInput } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import type React from "react";
import { useEffect, useRef } from "react";

type Props = {
  events: EventSourceInput;
};

const MOBILE_BREAKPOINT = 640;

const viewForWidth = (width: number) =>
  width < MOBILE_BREAKPOINT ? "timeGridThreeDay" : "timeGridWeek";

export const Tralendar = ({ events }: Props): React.JSX.Element => {
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    calendarRef.current?.getApi().changeView(viewForWidth(window.innerWidth));
  }, []);

  return (
    <div className="tralendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        views={{
          timeGridThreeDay: { type: "timeGrid", duration: { days: 3 } },
        }}
        windowResize={({ view }) => {
          const next = viewForWidth(window.innerWidth);
          if (view.type !== next) view.calendar.changeView(next);
        }}
        initialEvents={events}
        headerToolbar={{ left: "title", right: "today prev,next" }}
        buttonText={{ today: "Today" }}
        titleFormat={{ month: "short", day: "numeric", year: "numeric" }}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        dayHeaderContent={({ date, isToday }) => (
          <div className={isToday ? "day-header today" : "day-header"}>
            <span className="weekday">
              {date.toLocaleDateString("en", { weekday: "short" })}
            </span>
            <span className="day">{date.getDate()}</span>
          </div>
        )}
        slotLabelFormat={{ hour12: false, hour: "2-digit", minute: "2-digit" }}
        slotDuration="01:00"
        slotMinTime="06:00"
        slotMaxTime="24:00"
        firstDay={1}
        allDaySlot={false}
        nowIndicator
        expandRows
        locale="en"
        height="100%"
      />
    </div>
  );
};
