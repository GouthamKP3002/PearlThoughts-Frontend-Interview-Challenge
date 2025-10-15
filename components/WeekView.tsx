/**
 * WeekView Component
 *
 * Displays appointments for a week (Monday - Sunday) in a grid format.
 */

'use client';

import type { Appointment, Doctor } from '@/types';
import { APPOINTMENT_TYPE_CONFIG } from '@/types';
import { format, addDays, isSameDay, isToday } from 'date-fns';
import { getPatientById } from '@/data/mockData';

interface WeekViewProps {
  appointments: Appointment[];
  doctor: Doctor | undefined;
  weekStartDate: Date; // Should be a Monday
}

/**
 * Compact AppointmentCard for Week View
 */
function AppointmentCard({ appointment, compact = false }: { appointment: Appointment; compact?: boolean }) {
  const patient = getPatientById(appointment.patientId);
  const typeConfig = APPOINTMENT_TYPE_CONFIG[appointment.type];
  const startTime = format(new Date(appointment.startTime), 'h:mm a');

  return (
    <div
      className="rounded p-2 border-l-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-1 text-xs"
      style={{
        borderLeftColor: typeConfig.color,
        backgroundColor: `${typeConfig.color}15`,
      }}
    >
      <div className="font-semibold text-xs truncate">
        {patient?.name || 'Unknown'}
      </div>
      {!compact && (
        <>
          <div className="text-xs text-gray-600 mt-0.5">{startTime}</div>
          <div
            className="text-xs px-1.5 py-0.5 rounded-full inline-block mt-1"
            style={{
              backgroundColor: typeConfig.color,
              color: 'white',
            }}
          >
            {typeConfig.label}
          </div>
        </>
      )}
      {compact && (
        <div className="text-xs text-gray-600">{startTime}</div>
      )}
    </div>
  );
}

/**
 * WeekView Component - Renders a weekly calendar grid with appointments
 */
export function WeekView({ appointments, doctor, weekStartDate }: WeekViewProps) {
  /**
   * Generate array of 7 dates (Monday through Sunday)
   */
  function getWeekDays(): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStartDate, i));
    }
    return days;
  }

  /**
   * Generate time slots (8 AM - 6 PM, hourly for week view)
   */
  function generateTimeSlots() {
    const slots = [];
    const startHour = 8;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      const date = new Date();
      date.setHours(hour, 0, 0, 0);
      slots.push({
        hour,
        label: format(date, 'h a'),
      });
    }
    return slots;
  }

  /**
   * Get appointments for a specific day
   */
  function getAppointmentsForDay(date: Date): Appointment[] {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return isSameDay(aptDate, date);
    });
  }

  /**
   * Get appointments for a specific day and hour
   */
  function getAppointmentsForDayAndSlot(date: Date, hour: number): Appointment[] {
    return appointments.filter((apt) => {
      const aptStart = new Date(apt.startTime);
      return isSameDay(aptStart, date) && aptStart.getHours() === hour;
    });
  }

  const weekDays = getWeekDays();
  const timeSlots = generateTimeSlots();

  // Group appointments by day for summary
  const appointmentsByDay = weekDays.map((day) => getAppointmentsForDay(day));

  return (
    <div className="week-view">
      {/* Week header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </h3>
        {doctor && (
          <p className="text-sm text-gray-600">
            Dr. {doctor.name} - {doctor.specialty}
          </p>
        )}
      </div>

      {/* Week grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[900px]">
            {/* Header Row - Days of Week */}
            <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <div className="p-3 text-sm font-medium text-gray-600 border-r border-gray-200">
                Time
              </div>
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                    isToday(day) ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isToday(day) ? 'text-blue-700 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    {format(day, 'MMM d')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots Grid */}
            <div className="overflow-y-auto max-h-[500px]">
              {timeSlots.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className="grid grid-cols-8 border-b border-gray-100 min-h-[90px]"
                >
                  {/* Time Label */}
                  <div className="p-2 text-sm font-medium text-gray-600 border-r border-gray-200 flex items-start">
                    {slot.label}
                  </div>

                  {/* Day Columns */}
                  {weekDays.map((day, dayIndex) => {
                    const dayAppointments = getAppointmentsForDayAndSlot(day, slot.hour);

                    return (
                      <div
                        key={dayIndex}
                        className={`p-2 border-r border-gray-100 last:border-r-0 ${
                          isToday(day) ? 'bg-blue-50/30' : 'hover:bg-gray-50'
                        }`}
                      >
                        {dayAppointments.length > 0 ? (
                          <div className="space-y-1">
                            {dayAppointments.map((apt) => (
                              <AppointmentCard key={apt.id} appointment={apt} compact />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-3">
          <div className="grid grid-cols-8 text-center text-sm">
            <div className="text-gray-600 font-medium">Total</div>
            {appointmentsByDay.map((dayApts, index) => (
              <div key={index} className="font-semibold text-gray-900">
                {dayApts.length} {dayApts.length === 1 ? 'apt' : 'apts'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {appointments.length === 0 && (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mt-4">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
            <p className="mt-1 text-sm text-gray-500">
              No appointments scheduled for this week
            </p>
          </div>
        </div>
      )}
    </div>
  );
}