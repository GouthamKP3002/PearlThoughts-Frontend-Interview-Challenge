/**
 * DayView Component
 *
 * Displays appointments for a single day in a timeline format.
 */

'use client';

import type { Appointment, Doctor, TimeSlot } from '@/types';
import { APPOINTMENT_TYPE_CONFIG } from '@/types';
import { format } from 'date-fns';
import { getPatientById } from '@/data/mockData';

interface DayViewProps {
  appointments: Appointment[];
  doctor: Doctor | undefined;
  date: Date;
}

/**
 * AppointmentCard Component - Reusable card for displaying appointments
 */
function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const patient = getPatientById(appointment.patientId);
  const typeConfig = APPOINTMENT_TYPE_CONFIG[appointment.type];
  const startTime = format(new Date(appointment.startTime), 'h:mm a');
  const endTime = format(new Date(appointment.endTime), 'h:mm a');
  const duration = Math.round(
    (new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) /
      (1000 * 60)
  );

  return (
    <div
      className="rounded-lg p-3 border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-2"
      style={{
        borderLeftColor: typeConfig.color,
        backgroundColor: `${typeConfig.color}15`,
      }}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-sm text-gray-900">
            {patient?.name || 'Unknown Patient'}
          </h4>
          <span
            className="text-xs px-2 py-1 rounded-full font-medium ml-2"
            style={{
              backgroundColor: typeConfig.color,
              color: 'white',
            }}
          >
            {typeConfig.label}
          </span>
        </div>
        <p className="text-xs text-gray-600">
          {startTime} - {endTime} ({duration} min)
        </p>
      </div>
    </div>
  );
}

/**
 * DayView Component - Renders a daily timeline view with appointments
 */
export function DayView({ appointments, doctor, date }: DayViewProps) {
  /**
   * Generate time slots from 8 AM to 6 PM with 30-minute intervals
   */
  function generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;
    const intervalMinutes = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const start = new Date(date);
        start.setHours(hour, minute, 0, 0);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + intervalMinutes);

        slots.push({
          start,
          end,
          label: format(start, 'h:mm a'),
        });
      }
    }

    return slots;
  }

  /**
   * Find appointments that overlap with a specific time slot
   */
  function getAppointmentsForSlot(slot: TimeSlot): Appointment[] {
    return appointments.filter((apt) => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      
      // Check if appointment overlaps with this slot
      return aptStart < slot.end && aptEnd > slot.start;
    });
  }

  const timeSlots = generateTimeSlots();
  const now = new Date();
  const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

  return (
    <div className="day-view">
      {/* Day header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h3>
        {doctor && (
          <p className="text-sm text-gray-600">
            Dr. {doctor.name} - {doctor.specialty}
          </p>
        )}
      </div>

      {/* Timeline grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-y-auto max-h-[600px] scrollbar-thin">
          {timeSlots.map((slot, index) => {
            const slotAppointments = getAppointmentsForSlot(slot);
            
            // Check if this is the current time slot
            const isCurrentSlot = isToday && 
              now >= slot.start && 
              now < slot.end;

            return (
              <div
                key={index}
                className={`grid grid-cols-[100px_1fr] border-b border-gray-100 min-h-[70px] ${
                  isCurrentSlot ? 'bg-yellow-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Time Label */}
                <div className="p-3 text-sm font-medium text-gray-600 border-r border-gray-200 flex items-start">
                  <span>{slot.label}</span>
                  {isCurrentSlot && (
                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </div>

                {/* Appointments */}
                <div className="p-2">
                  {slotAppointments.length > 0 ? (
                    <div className="space-y-2">
                      {slotAppointments.map((apt) => (
                        <AppointmentCard key={apt.id} appointment={apt} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
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
              No appointments scheduled for {format(date, 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}