/**
 * Appointment Service
 * 
 * Service layer for data access and business logic.
 * Provides a clean abstraction over mock data operations.
 */

import {
  MOCK_APPOINTMENTS,
  MOCK_DOCTORS,
  MOCK_PATIENTS,
  getDoctorById as mockGetDoctorById,
  getPatientById as mockGetPatientById,
} from '../data/mockData';
import type {
  Appointment,
  Doctor,
  Patient,
  PopulatedAppointment,
  AppointmentFilters,
} from '../types';

/**
 * Appointment Service Class
 * Handles all data access for appointments, doctors, and patients
 */
export class AppointmentService {
  /**
   * Get all doctors
   */
  getAllDoctors(): Doctor[] {
    return MOCK_DOCTORS;
  }

  /**
   * Get doctor by ID
   */
  getDoctorById(id: string): Doctor | undefined {
    return mockGetDoctorById(id);
  }

  /**
   * Get patient by ID
   */
  getPatientById(id: string): Patient | undefined {
    return mockGetPatientById(id);
  }

  /**
   * Get all appointments for a specific doctor
   */
  getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return MOCK_APPOINTMENTS.filter((apt) => apt.doctorId === doctorId);
  }

  /**
   * Get appointments for a doctor on a specific date
   */
  getAppointmentsByDoctorAndDate(doctorId: string, date: Date): Appointment[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return MOCK_APPOINTMENTS.filter((apt) => {
      if (apt.doctorId !== doctorId) return false;

      const aptStart = new Date(apt.startTime);
      return aptStart >= startOfDay && aptStart <= endOfDay;
    });
  }

  /**
   * Get appointments for a doctor within a date range (for week view)
   */
  getAppointmentsByDoctorAndDateRange(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ): Appointment[] {
    return MOCK_APPOINTMENTS.filter((apt) => {
      if (apt.doctorId !== doctorId) return false;

      const aptStart = new Date(apt.startTime);
      return aptStart >= startDate && aptStart <= endDate;
    });
  }

  /**
   * Get appointments with populated patient and doctor data
   */
  getPopulatedAppointments(appointments: Appointment[]): PopulatedAppointment[] {
    return appointments
      .map((apt) => {
        const patient = this.getPatientById(apt.patientId);
        const doctor = this.getDoctorById(apt.doctorId);

        if (!patient || !doctor) return null;

        return {
          ...apt,
          patient,
          doctor,
        } as PopulatedAppointment;
      })
      .filter((apt): apt is PopulatedAppointment => apt !== null);
  }

  /**
   * Get appointments with filters
   */
  getFilteredAppointments(filters: AppointmentFilters): Appointment[] {
    let filtered = [...MOCK_APPOINTMENTS];

    if (filters.doctorId) {
      filtered = filtered.filter((apt) => apt.doctorId === filters.doctorId);
    }

    if (filters.date) {
      filtered = this.getAppointmentsByDoctorAndDate(
        filters.doctorId || '',
        filters.date
      );
    }

    if (filters.startDate && filters.endDate) {
      filtered = this.getAppointmentsByDoctorAndDateRange(
        filters.doctorId || '',
        filters.startDate,
        filters.endDate
      );
    }

    if (filters.type) {
      filtered = filtered.filter((apt) => apt.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter((apt) => apt.status === filters.status);
    }

    return filtered;
  }
}

// Export singleton instance
export const appointmentService = new AppointmentService();