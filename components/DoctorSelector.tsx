/**
 * DoctorSelector Component
 * 
 * Dropdown for selecting a doctor with display of specialty and working hours
 */

import React from 'react';
import type { Doctor } from '../types';

interface DoctorSelectorProps {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  onSelectDoctor: (doctor: Doctor) => void;
}

export function DoctorSelector({
  doctors,
  selectedDoctor,
  onSelectDoctor,
}: DoctorSelectorProps) {
  const formatWorkingHours = (doctor: Doctor): string => {
    const days = Object.keys(doctor.workingHours);
    if (days.length === 0) return 'No working hours set';
    
    const firstDay = doctor.workingHours[days[0] as keyof typeof doctor.workingHours];
    if (!firstDay) return 'No working hours set';
    
    return `${firstDay.start} - ${firstDay.end}`;
  };

  const capitalizeSpecialty = (specialty: string): string => {
    return specialty
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-2">
      <label htmlFor="doctor-select" className="block text-sm font-medium text-gray-700">
        Select Doctor
      </label>
      <select
        id="doctor-select"
        value={selectedDoctor?.id || ''}
        onChange={(e) => {
          const doctor = doctors.find((d) => d.id === e.target.value);
          if (doctor) onSelectDoctor(doctor);
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name} - {capitalizeSpecialty(doctor.specialty)}
          </option>
        ))}
      </select>

      {selectedDoctor && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-900">{selectedDoctor.name}</h3>
          <p className="text-sm text-blue-700 mt-1">
            {capitalizeSpecialty(selectedDoctor.specialty)}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Working Hours: {formatWorkingHours(selectedDoctor)}
          </p>
          <p className="text-xs text-blue-600">
            {selectedDoctor.phone} • {selectedDoctor.email}
          </p>
        </div>
      )}
    </div>
  );
}