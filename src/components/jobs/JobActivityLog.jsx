import React from 'react';
import { FiClock, FiUser, FiEdit2, FiCheckCircle, FiAlertCircle, FiFileText } from 'react-icons/fi';

const JobActivityLog = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FiClock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'status_changed':
        return <FiAlertCircle className="h-5 w-5 text-blue-500" />;
      case 'assigned':
        return <FiUser className="h-5 w-5 text-purple-500" />;
      case 'note_added':
        return <FiFileText className="h-5 w-5 text-yellow-500" />;
      case 'updated':
        return <FiEdit2 className="h-5 w-5 text-orange-500" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity) => {
    const userName = activity.userName || 'System';
    
    switch (activity.type) {
      case 'created':
        return `Job created by ${userName}`;
      
      case 'status_changed':
        return (
          <div>
            <p className="font-medium">Status changed by {userName}</p>
            <p className="text-xs text-gray-600 mt-1">
              <span className="line-through">{activity.oldValue}</span> → <span className="font-semibold">{activity.newValue}</span>
            </p>
          </div>
        );
      
      case 'assigned':
        return (
          <div>
            <p className="font-medium">Technician reassigned by {userName}</p>
            <p className="text-xs text-gray-600 mt-1">
              <span className="line-through">{activity.oldValue}</span> → <span className="font-semibold">{activity.newValue}</span>
            </p>
          </div>
        );
      
      case 'note_added':
        return (
          <div>
            <p className="font-medium">Notes updated by {userName}</p>
            <div className="text-xs text-gray-600 mt-1 space-y-1">
              {activity.oldValue && activity.oldValue !== '(none)' && (
                <p className="line-through">Old: "{activity.oldValue.substring(0, 50)}{activity.oldValue.length > 50 ? '...' : ''}"</p>
              )}
              {activity.newValue && activity.newValue !== '(removed)' && (
                <p className="font-semibold">New: "{activity.newValue.substring(0, 50)}{activity.newValue.length > 50 ? '...' : ''}"</p>
              )}
            </div>
          </div>
        );
      
      case 'updated':
        if (activity.field && activity.field !== 'general') {
          return (
            <div>
              <p className="font-medium capitalize">{activity.field} updated by {userName}</p>
              {activity.oldValue && activity.newValue && (
                <p className="text-xs text-gray-600 mt-1">
                  <span className="line-through capitalize">{activity.oldValue}</span> → <span className="font-semibold capitalize">{activity.newValue}</span>
                </p>
              )}
            </div>
          );
        }
        return `Job details updated by ${userName}`;
      
      default:
        return activity.message || 'Activity logged';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900">{getActivityMessage(activity)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobActivityLog;
