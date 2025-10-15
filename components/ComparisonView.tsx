/**
 * ComparisonView Component
 * 
 * Displays side-by-side comparison of all doctors' schedules
 */

'use client';

import React from 'react';
import type { Appointment, Doctor } from '@/types';
import { APPOINTMENT_TYPE_CONFIG } from '@/types';
import { format, isSameDay, isToday } from 'date-fns';
import { getPatientById } from '@/data/mockData';

interface ComparisonViewProps {
  doctors: Doctor[];
  allAppointments: Appointment[];
  selectedDate: Date;
  view: 'day' | 'week';
}

/**
 * Compact AppointmentCard for comparison view
 */
function CompactAppointmentCard({ appointment }: { appointment: Appointment }) {
  const patient = getPatientById(appointment.patientId);
  const typeConfig = APPOINTMENT_TYPE_CONFIG[appointment.type];
  const startTime = format(new Date(appointment.startTime), 'h:mm a');

  return (
    <div
      className="rounded p-1.5 border-l-2 mb-1 text-xs hover:shadow-sm transition-shadow cursor-pointer"
      style={{
        borderLeftColor: typeConfig.color,
        backgroundColor: `${typeConfig.color}10`,
      }}
    >
      <div className="font-semibold truncate text-xs">
        {patient?.name || 'Unknown'}
      </div>
      <div className="text-xs text-gray-600">{startTime}</div>
    </div>
  );
}

/**
 * ComparisonView Component
 */
export function ComparisonView({ doctors, allAppointments, selectedDate, view }: ComparisonViewProps) {
  // Generate time slots (8 AM - 6 PM, hourly for better comparison)
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      const date = new Date();
      date.setHours(hour, 0, 0, 0);
      slots.push({
        hour,
        label: format(date, 'h a'),
      });
    }
    return slots;
  }, []);

  // Get appointments for each doctor
  const doctorAppointments = doctors.map((doctor) => {
    const appointments = allAppointments.filter(
      (apt) => apt.doctorId === doctor.id && isSameDay(new Date(apt.startTime), selectedDate)
    );
    return { doctor, appointments };
  });

  // Calculate statistics
  const stats = doctorAppointments.map(({ doctor, appointments }) => {
    const totalMinutes = appointments.reduce((sum, apt) => {
      const duration = (new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()) / (1000 * 60);
      return sum + duration;
    }, 0);
    
    return {
      doctor,
      count: appointments.length,
      totalHours: (totalMinutes / 60).toFixed(1),
      byType: {
        checkup: appointments.filter(a => a.type === 'checkup').length,
        consultation: appointments.filter(a => a.type === 'consultation').length,
        'follow-up': appointments.filter(a => a.type === 'follow-up').length,
        procedure: appointments.filter(a => a.type === 'procedure').length,
      }
    };
  });

  return (
    <div className="comparison-view">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Doctor Schedule Comparison</h2>
            <p className="text-sm text-gray-600 mt-1">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              Total: {allAppointments.filter(apt => isSameDay(new Date(apt.startTime), selectedDate)).length} appointments
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map(({ doctor, count, totalHours, byType }) => (
          <div key={doctor.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                <p className="text-xs text-gray-600 capitalize">{doctor.specialty.replace('-', ' ')}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-xs text-gray-600">appointments</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Total hours:</span>
                <span className="font-semibold">{totalHours}h</span>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {byType.checkup > 0 && (
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                    <span>Checkup: {byType.checkup}</span>
                  </div>
                )}
                {byType.consultation > 0 && (
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span>Consult: {byType.consultation}</span>
                  </div>
                )}
                {byType['follow-up'] > 0 && (
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
                    <span>Follow-up: {byType['follow-up']}</span>
                  </div>
                )}
                {byType.procedure > 0 && (
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                    <span>Procedure: {byType.procedure}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[900px]">
            {/* Header Row */}
            <div className="grid grid-cols-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="p-3 text-sm font-semibold text-gray-700 border-r border-gray-200">
                Time
              </div>
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="p-3 border-r border-gray-200 last:border-r-0"
                >
                  <div className="text-sm font-semibold text-gray-900">{doctor.name}</div>
                  <div className="text-xs text-gray-600 capitalize mt-0.5">
                    {doctor.specialty.replace('-', ' ')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="overflow-y-auto max-h-[500px]">
              {timeSlots.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className="grid grid-cols-4 border-b border-gray-100 min-h-[80px] hover:bg-gray-50"
                >
                  {/* Time Label */}
                  <div className="p-2 text-sm font-medium text-gray-600 border-r border-gray-200 flex items-start">
                    {slot.label}
                  </div>

                  {/* Doctor Columns */}
                  {doctors.map((doctor) => {
                    const appointments = allAppointments.filter((apt) => {
                      const aptStart = new Date(apt.startTime);
                      return (
                        apt.doctorId === doctor.id &&
                        isSameDay(aptStart, selectedDate) &&
                        aptStart.getHours() === slot.hour
                      );
                    });

                    return (
                      <div
                        key={doctor.id}
                        className="p-2 border-r border-gray-100 last:border-r-0"
                      >
                        {appointments.length > 0 ? (
                          <div className="space-y-1">
                            {appointments.map((apt) => (
                              <CompactAppointmentCard key={apt.id} appointment={apt} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 text-xs py-4">—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {allAppointments.filter(apt => isSameDay(new Date(apt.startTime), selectedDate)).length === 0 && (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mt-6">
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
              No appointments scheduled for any doctor on {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}