import React from 'react';
import StatusBadge from './StatusBadge';
import { STATUS_VALUES, PRIORITY_COLORS } from '../utils/constants';
import { resolveImageUrl } from '../utils/auth';

export default function ComplaintDetailsModal({ complaint, isOpen, onClose }) {
  if (!isOpen || !complaint) return null;

  // Parse location coordinate representation
  const lat = complaint.location?.coordinates?.[1];
  const lng = complaint.location?.coordinates?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
              #{complaint.complaintId}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {complaint.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
            <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* Key Info Badges */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <div className="mt-1 block">
                <StatusBadge status={complaint.status} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</span>
              <div className="mt-1 block">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_COLORS[complaint.effectivePriority || complaint.priority] || "bg-gray-100"}`}>
                  {complaint.effectivePriority || complaint.priority}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supports</span>
              <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                👍 {complaint.supportCount || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency</span>
              <div className="mt-1">
                {complaint.isEmergency ? (
                  <span className="inline-flex rounded-full bg-red-100 dark:bg-red-950 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">
                    🚨 EMERGENCY
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Table List */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-500">Category</span>
              <span className="font-medium text-slate-900 dark:text-slate-200">{complaint.category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-500">Assigned Department</span>
              <span className="font-medium text-slate-900 dark:text-slate-200">{complaint.department || "Not assigned"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-500">Area</span>
              <span className="font-medium text-slate-900 dark:text-slate-200">{complaint.area || "Unknown"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-500">Address</span>
              <span className="font-medium text-slate-900 dark:text-slate-200 text-right">{complaint.address || "N/A"}</span>
            </div>
            {lat && lng && (
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-500">Coordinates</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-500">Registered On</span>
              <span className="font-medium text-slate-900 dark:text-slate-200">
                {new Date(complaint.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </span>
            </div>
          </div>

          {/* Image Proof */}
          {complaint.imageUrl && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image Proof</h4>
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100">
                <img
                  src={resolveImageUrl(complaint.imageUrl)}
                  alt="Complaint proof"
                  className="max-h-64 w-full object-cover transition duration-300 hover:scale-105"
                />
              </div>
            </div>
          )}

          {/* Status Timeline / Stepper (Item 15) */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Status Timeline</h4>
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 py-2 border-t border-b border-slate-100 dark:border-slate-800">
              {STATUS_VALUES.map((step, index) => {
                const isCompleted = STATUS_VALUES.indexOf(complaint.status) >= index;
                const isActive = complaint.status === step;
                return (
                  <div key={step} className="flex flex-col items-center flex-1 min-w-[70px]">
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-400 dark:bg-slate-800'
                        }`}
                      >
                        {isCompleted && !isActive ? '✓' : index + 1}
                      </div>
                    </div>
                    <span
                      className={`mt-2 text-center text-[10px] font-bold tracking-tight transition ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : isCompleted
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complaint History Log (Item 20) */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">History Log</h4>
            <div className="space-y-4 relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
              {(complaint.statusHistory || []).map((entry, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 group-hover:scale-125 transition" />
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Status: <span className="text-blue-600 dark:text-blue-400">{entry.status}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(entry.changedAt || entry.createdAt || complaint.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {entry.note}
                    </p>
                  )}
                  {entry.changedBy && (
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Updated By: <span className="font-semibold">{entry.changedBy.name}</span> ({entry.changedBy.role === 'admin' ? 'Admin' : 'Department Staff'})
                    </p>
                  )}
                </div>
              ))}
              {(!complaint.statusHistory || complaint.statusHistory.length === 0) && (
                <div className="relative group text-xs text-slate-400">
                  No status transitions logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
