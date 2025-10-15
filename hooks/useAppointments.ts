/**
 * Custom Hooks for Appointment Management
 * 
 * Implements the headless pattern - separating business logic from UI
 */

import { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import type {
  Appointment,
  Doctor,
} from '../types';
import { startOfWeek, addDays } from 'date-fns';

/**
 * Hook for managing appointments with filters (returns raw Appointment[])
 */
export function useAppointments(doctorId: string, date: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!doctorId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const rawAppointments = appointmentService.getAppointmentsByDoctorAndDate(
        doctorId,
        date
      );
      setAppointments(rawAppointments);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [doctorId, date]);

  return { appointments, loading, error };
}

/**
 * Hook for managing week view appointments (returns raw Appointment[])
 */
export function useWeekAppointments(doctorId: string, weekStartDate: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!doctorId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const monday = startOfWeek(weekStartDate, { weekStartsOn: 1 });
      const sunday = addDays(monday, 6);
      sunday.setHours(23, 59, 59, 999);

      const rawAppointments = appointmentService.getAppointmentsByDoctorAndDateRange(
        doctorId,
        monday,
        sunday
      );
      setAppointments(rawAppointments);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [doctorId, weekStartDate]);

  return { appointments, loading, error };
}

/**
 * Hook for managing all appointments (for comparison view)
 */
export function useAllAppointments(date: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all appointments for the day
      const allAppointments = appointmentService.getFilteredAppointments({
        startDate: startOfDay,
        endDate: endOfDay,
      });

      setAppointments(allAppointments);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  return { appointments, loading, error };
}

/**
 * Hook for managing doctor selection
 */
export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      const allDoctors = appointmentService.getAllDoctors();
      setDoctors(allDoctors);
      if (allDoctors.length > 0) {
        setSelectedDoctor(allDoctors[0]);
      }
    } catch (err) {
      console.error('Error loading doctors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    doctors,
    selectedDoctor,
    setSelectedDoctor,
    loading,
  };
}

/**
 * Hook for calendar view state management
 */
export function useCalendarView() {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const toggleView = () => {
    setView((prev) => (prev === 'day' ? 'week' : 'day'));
  };

  return {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    toggleView,
  };
}