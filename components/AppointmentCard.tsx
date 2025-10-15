/**
 * AppointmentCard Component
 * 
 * Reusable component for displaying appointment information
 */

import React from 'react';
import type { PopulatedAppointment } from '../types';
import { APPOINTMENT_TYPE_CONFIG } from '../types';
import { format } from 'date-fns';

interface AppointmentCardProps {
  appointment: PopulatedAppointment;
  compact?: boolean;
  showDoctor?: boolean;
}

export function AppointmentCard({
  appointment,
  compact = false,
  showDoctor = false,
}: AppointmentCardProps) {
  const typeConfig = APPOINTMENT_TYPE_CONFIG[appointment.type];
  const startTime = format(new Date(appointment.startTime), 'h:mm a');
  const endTime = format(new Date(appointment.endTime), 'h:mm a');
  const duration = Math.round(
    (new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) /
      (1000 * 60)
  );

  return (
    <div
      className="rounded-lg p-3 border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      style={{
        borderLeftColor: typeConfig.color,
        backgroundColor: `${typeConfig.color}10`,
      }}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-sm text-gray-900">
            {appointment.patient.name}
          </h4>
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: typeConfig.color,
              color: 'white',
            }}
          >
            {typeConfig.label}
          </span>
        </div>

        {!compact && (
          <>
            <p className="text-xs text-gray-600">
              {startTime} - {endTime} ({duration} min)
            </p>
            {showDoctor && (
              <p className="text-xs text-gray-500">{appointment.doctor.name}</p>
            )}
          </>
        )}

        {compact && (
          <p className="text-xs text-gray-600">{startTime}</p>
        )}
      </div>
    </div>
  );
}