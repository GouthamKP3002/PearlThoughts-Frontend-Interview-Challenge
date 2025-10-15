/**
 * ScheduleView Component
 * 
 * Fixed: Responsive issues and layout problems
 */

'use client';

import React, { useState } from 'react';
import { DoctorSelector } from './DoctorSelector';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { ComparisonView } from './ComparisonView';
import {
  useDoctors,
  useCalendarView,
  useAppointments,
  useWeekAppointments,
} from '../hooks/useAppointments';
import { format, startOfWeek } from 'date-fns';
import { MOCK_APPOINTMENTS } from '../data/mockData';

export function ScheduleView() {
  const { doctors, selectedDoctor, setSelectedDoctor, loading: doctorsLoading } = useDoctors();
  const { view, setView, selectedDate, setSelectedDate } = useCalendarView();
  const [showComparison, setShowComparison] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { appointments: dayAppointments, loading: dayLoading } = useAppointments(
    selectedDoctor?.id || '',
    selectedDate
  );

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const { appointments: weekAppointments, loading: weekLoading } = useWeekAppointments(
    selectedDoctor?.id || '',
    weekStart
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const toggleComparison = () => {
    setShowComparison(!showComparison);
    if (sidebarOpen) setSidebarOpen(false); // Close sidebar on mobile when toggling
  };

  if (doctorsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation Bar - Fully Responsive */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo and Title */}
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-2 p-2 rounded-md text-gray-600 hover:bg-gray-100 flex-shrink-0 md:hidden"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-2 sm:ml-3 min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">MediSchedule</h1>
                  <p className="text-xs text-gray-600 hidden sm:block">Hospital Appointment System</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              {/* Comparison Toggle */}
              <button
                onClick={toggleComparison}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                  showComparison
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">
                  {showComparison ? 'Exit Comparison' : 'Compare Doctors Schedules'}
                </span>
                <span className="sm:hidden">Compare</span>
              </button>

              {/* View Toggle - Hidden in comparison mode */}
              {!showComparison && (
                <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setView('day')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      view === 'day'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      view === 'week'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Week
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        {/* Sidebar - Responsive */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:relative
          inset-y-0 left-0
          z-40
          w-72 sm:w-80
          bg-white
          border-r border-gray-200
          transition-transform duration-300
          ease-in-out
          overflow-y-auto
          scrollbar-thin
          shadow-xl lg:shadow-none
          mt-14 sm:mt-16 lg:mt-0
          h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] lg:h-full
        `}>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Doctor Selection */}
            {!showComparison && (
              <DoctorSelector
                doctors={doctors}
                selectedDoctor={selectedDoctor}
                onSelectDoctor={setSelectedDoctor}
              />
            )}

            {showComparison && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-purple-900 flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Comparison Mode
                </h3>
                <p className="text-sm text-purple-700 mt-2">
                  Viewing schedules for all {doctors.length} doctors side-by-side
                </p>
              </div>
            )}

            {/* Mobile View Toggle - Only shown in mobile when not in comparison */}
            {!showComparison && (
              <div className="sm:hidden ">
                <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setView('day')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      view === 'day'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      view === 'week'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
            )}

            {/* Date Picker */}
            <div className="space-y-2">
              <label htmlFor="date-picker" className="block text-sm font-semibold text-gray-700">
                Select Date
              </label>
              <input
                id="date-picker"
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
              />
            </div>

            <button
              onClick={goToToday}
              className="w-full px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Go to Today
              </span>
            </button>

            {/* Legend */}
            <div className="pt-4 sm:pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Appointment Types
              </h3>
              <div className="space-y-2">
                {[
                  { color: 'bg-blue-500', name: 'Checkup', duration: '30 min' },
                  { color: 'bg-green-500', name: 'Consultation', duration: '60 min' },
                  { color: 'bg-orange-500', name: 'Follow-up', duration: '30 min' },
                  { color: 'bg-purple-500', name: 'Procedure', duration: '90 min' },
                ].map(({ color, name, duration }) => (
                  <div key={name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded ${color}`}></div>
                      <span className="ml-2 text-sm text-gray-700">{name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            {!showComparison && selectedDoctor && (
              <div className="pt-4 sm:pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {view === 'day' ? dayAppointments.length : weekAppointments.length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {view === 'day' ? "Today's" : "This Week's"} Appointments
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-200 bg-opacity-50 z-30 lg:hidden mt-14 sm:mt-16"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area - Fixed */}
        <div className="flex-1 overflow-auto scrollbar-thin">
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8 max-w-full">
            {showComparison ? (
              <ComparisonView
                doctors={doctors}
                allAppointments={MOCK_APPOINTMENTS}
                selectedDate={selectedDate}
                view={view}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                {/* Calendar Header */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {selectedDoctor ? selectedDoctor.name : 'Select a Doctor'}
                      </h2>
                      {selectedDoctor && (
                        <p className="mt-1 text-sm text-gray-600 capitalize">
                          {selectedDoctor.specialty.replace('-', ' ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                        <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-sm font-medium text-blue-900">
                          {view === 'day' ? dayAppointments.length : weekAppointments.length}{' '}
                          {(view === 'day' ? dayAppointments.length : weekAppointments.length) === 1
                            ? 'appointment'
                            : 'appointments'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar Content */}
                {!selectedDoctor ? (
                  <div className="flex items-center justify-center h-64 sm:h-96 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center p-4">
                      <svg
                        className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">
                        Select a doctor to begin
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Choose a doctor from the sidebar to view their schedule
                      </p>
                    </div>
                  </div>
                ) : dayLoading || weekLoading ? (
                  <div className="flex items-center justify-center h-64 sm:h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading appointments...</p>
                    </div>
                  </div>
                ) : view === 'day' ? (
                  <DayView
                    appointments={dayAppointments}
                    doctor={selectedDoctor}
                    date={selectedDate}
                  />
                ) : (
                  <WeekView
                    appointments={weekAppointments}
                    doctor={selectedDoctor}
                    weekStartDate={weekStart}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}