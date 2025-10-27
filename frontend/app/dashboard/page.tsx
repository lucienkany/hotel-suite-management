// frontend/app/dashboard/page.tsx
'use client';

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Your overview will appear here.
        </p>
      </div>

      {/* Placeholder for future content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat Card Placeholder 1 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-blue-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-100 rounded w-24"></div>
            <div className="h-4 bg-gray-50 rounded w-32"></div>
          </div>
        </div>

        {/* Stat Card Placeholder 2 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Bookings</h3>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-green-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-100 rounded w-24"></div>
            <div className="h-4 bg-gray-50 rounded w-32"></div>
          </div>
        </div>

        {/* Stat Card Placeholder 3 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Occupancy</h3>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-purple-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-100 rounded w-24"></div>
            <div className="h-4 bg-gray-50 rounded w-32"></div>
          </div>
        </div>

        {/* Stat Card Placeholder 4 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Guests</h3>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-orange-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-100 rounded w-24"></div>
            <div className="h-4 bg-gray-50 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart Placeholder 1 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Overview
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400 text-sm">Chart will appear here</p>
          </div>
        </div>

        {/* Chart Placeholder 2 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Trends
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400 text-sm">Chart will appear here</p>
          </div>
        </div>
      </div>

      {/* Additional Content Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="h-16 bg-gray-50 rounded-lg"></div>
          <div className="h-16 bg-gray-50 rounded-lg"></div>
          <div className="h-16 bg-gray-50 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
