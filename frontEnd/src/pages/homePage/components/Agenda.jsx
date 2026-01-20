import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../../../index.css";

function formatMesBonito(date) {
    const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function Agenda({ onMonthChange }) {
    const calRef = useRef(null);

    const [events, setEvents] = useState([]);
    const [eventOpen, setEventOpen] = useState(false);
    const [selectDate, setSelectDate] = useState(null);
    const [eventTitle, setEventTitle] = useState("");

    const [mesLabel, setMesLabel] = useState(() => formatMesBonito(new Date()));

    function api() {
        return calRef.current?.getApi?.();
    }

    function handleDateClick(info) {
        setSelectDate(info.dateStr);
        setEventOpen(true);
    }

    function handleSaveEvent() {
        const title = eventTitle.trim();
        if (!title || !selectDate) return;

        setEvents((prev) => [...prev, { id: String(Date.now()), title, start: selectDate, allDay: true }]);
        setEventTitle("");
        setEventOpen(false);
    }

    return (
        <div className="rounded-3xl border border-yellow-400/15 bg-zinc-950/60 p-4 shadow-[0_0_0_1px_rgba(250,204,21,0.08)] backdrop-blur">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
            <div>
            <h2 className="text-lg font-extrabold text-white">{mesLabel}</h2>
            <p className="text-xs text-zinc-400">Clique em um dia para criar um evento.</p>
            </div>

            <div className="flex items-center gap-2">
            <button
                onClick={() => api()?.prev()}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/70"
                type="button"
                aria-label="Mês anterior"
                title="Mês anterior"
            >
                ←
            </button>

            <button
                onClick={() => api()?.today()}
                className="rounded-xl border border-yellow-400/20 bg-yellow-400 px-3 py-2 text-sm font-extrabold text-zinc-950 hover:bg-yellow-300"
                type="button"
                aria-label="Ir para hoje"
                title="Hoje"
            >
                Hoje
            </button>

            <button
                onClick={() => api()?.next()}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/70"
                type="button"
                aria-label="Próximo mês"
                title="Próximo mês"
            >
                →
            </button>
            </div>
        </div>

        <div className="mt-3">
            <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={false}
            initialView="dayGridMonth"
            locale="pt-br"
            height="auto"
            expandRows={false}
            fixedWeekCount={false}
            events={events}
            dateClick={handleDateClick}
            datesSet={(info) => {
                const d = info.view.currentStart;
                setMesLabel(formatMesBonito(d));
                onMonthChange?.(d);
            }}
            />
        </div>

        {/* Modal */}
        <div
            className={[
            "fixed inset-0 z-[9999] flex items-center justify-center p-4",
            eventOpen ? "" : "pointer-events-none opacity-0",
            ].join(" ")}
            aria-hidden={!eventOpen}
        >
            <div
            className={[
                "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
                eventOpen ? "opacity-100" : "opacity-0",
            ].join(" ")}
            onClick={() => setEventOpen(false)}
            />

            <div
            className={[
                "relative w-full max-w-md rounded-3xl border border-yellow-400/15 bg-zinc-950/95 shadow-2xl",
                "transition-all",
                eventOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-4">
                <div>
                <h3 className="text-base font-extrabold text-white">Criar evento</h3>
                <p className="mt-1 text-sm text-zinc-400">
                    Data selecionada: <span className="font-semibold text-zinc-200">{selectDate}</span>
                </p>
                </div>

                <button
                onClick={() => setEventOpen(false)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                aria-label="Fechar"
                title="Fechar"
                >
                ✕
                </button>
            </div>

            <div className="space-y-3 p-4">
                <label className="block text-sm font-semibold text-zinc-200">Nome do evento</label>

                <input
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-yellow-400/30 focus:ring-2 focus:ring-yellow-400/10"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ex: Aula de Muay Thai"
                autoFocus
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                <button
                    onClick={() => setEventOpen(false)}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900/70"
                >
                    Cancelar
                </button>

                <button
                    onClick={handleSaveEvent}
                    disabled={!eventTitle.trim()}
                    className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-extrabold text-zinc-950 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Salvar
                </button>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}
