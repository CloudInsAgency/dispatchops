import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiPlus, FiUser, FiMapPin, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import JobDetailsModal from './JobDetailsModal';
import JobFilters from './JobFilters';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const JobBoard = ({ onCreateJob, selectedTechnicianId }) => {
  const { userProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [filterState, setFilterState] = useState({
    searchTerm: '',
    priority: 'all',
    jobType: 'all',
    dateRange: 'all'
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Fetch jobs from Firestore
  useEffect(() => {
    if (!userProfile?.companyId) return;

    const jobsRef = collection(db, 'companies', userProfile.companyId, 'jobs');
    const q = query(jobsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  // Apply all filters
  const getFilteredJobs = () => {
    let filtered = jobs;

    // Filter by technician
    if (selectedTechnicianId) {
      filtered = filtered.filter(job => job.assignedTo === selectedTechnicianId);
    }

    // Search filter
    if (filterState.searchTerm) {
      const searchLower = filterState.searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.customerName?.toLowerCase().includes(searchLower) ||
        job.address?.toLowerCase().includes(searchLower) ||
        job.customerPhone?.includes(searchLower)
      );
    }

    // Priority filter
    if (filterState.priority !== 'all') {
      filtered = filtered.filter(job => job.priority === filterState.priority);
    }

    // Job type filter
    if (filterState.jobType !== 'all') {
      filtered = filtered.filter(job => job.jobType === filterState.jobType);
    }

    // Date range filter
    if (filterState.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
      const nextWeekStart = new Date(endOfWeek);
      nextWeekStart.setDate(nextWeekStart.getDate() + 1);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

      filtered = filtered.filter(job => {
        if (!job.scheduledDateTime) return false;
        const jobDate = new Date(job.scheduledDateTime);

        switch (filterState.dateRange) {
          case 'today':
            return jobDate >= today && jobDate < tomorrow;
          case 'tomorrow':
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            return jobDate >= tomorrow && jobDate < dayAfterTomorrow;
          case 'thisWeek':
            return jobDate >= today && jobDate <= endOfWeek;
          case 'nextWeek':
            return jobDate >= nextWeekStart && jobDate <= nextWeekEnd;
          case 'overdue':
            return jobDate < today && job.status !== 'completed';
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredJobs = getFilteredJobs();

  // Group jobs by status
  const jobsByStatus = {
    unassigned: filteredJobs.filter(job => job.status === 'unassigned'),
    scheduled: filteredJobs.filter(job => job.status === 'scheduled'),
    in_progress: filteredJobs.filter(job => job.status === 'in_progress'),
    completed: filteredJobs.filter(job => job.status === 'completed')
  };

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return 'border-l-4 border-gray-300';
    }
  };

  // Format date/time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return null;
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dateStr} at ${timeStr}`;
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  // Drag and Drop Handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const jobId = active.id;
    let newStatus = over.id;

    const droppedOnJob = jobs.find(j => j.id === over.id);
    if (droppedOnJob) {
      newStatus = droppedOnJob.status;
    }

    const validStatuses = ['unassigned', 'scheduled', 'in_progress', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      setActiveId(null);
      return;
    }

    const job = jobs.find(j => j.id === jobId);
    if (job && job.status !== newStatus) {
      try {
        const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', jobId);
        await updateDoc(jobRef, {
          status: newStatus,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error updating job status:', error);
        alert('Failed to update job status');
      }
    }

    setActiveId(null);
  };

  // Sortable Job Card Component
  const SortableJobCard = ({ job }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: job.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white rounded-lg shadow-sm p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition ${getPriorityColor(job.priority)}`}
      >
        <div 
          onClick={(e) => {
            e.stopPropagation();
            handleJobClick(job);
          }}
          className="cursor-pointer"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{job.customerName}</h3>
            {job.priority === 'high' && (
              <FiAlertCircle className="text-red-500 h-5 w-5" />
            )}
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <FiMapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{job.address}</span>
            </div>
            
            <div className="flex items-center">
              <FiUser className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{job.assignedToName || 'Unassigned'}</span>
            </div>
            
            {job.scheduledDateTime && (
              <div className="flex items-center">
                <FiCalendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-primary-600 font-medium">{formatDateTime(job.scheduledDateTime)}</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase">{job.jobType}</span>
          </div>
        </div>
      </div>
    );
  };

  // Droppable Column Component
  const DroppableColumn = ({ id, title, jobs, count }) => {
    const { setNodeRef } = useSortable({ id });

    return (
      <div 
        ref={setNodeRef}
        className="flex-1 min-w-[280px] bg-gray-50 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <span className="ml-2 bg-gray-200 text-gray-700 text-sm font-semibold px-2 py-1 rounded-full">
              {count}
            </span>
          </div>
          {id === 'unassigned' && onCreateJob && (
            <button 
              onClick={onCreateJob}
              className="text-primary-600 hover:text-primary-700"
            >
              <FiPlus className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[200px]">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Drop jobs here</p>
              </div>
            ) : (
              jobs.map(job => <SortableJobCard key={job.id} job={job} />)
            )}
          </div>
        </SortableContext>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    );
  }

  const activeJob = jobs.find(j => j.id === activeId);

  return (
    <>
      {/* Filters */}
      <JobFilters 
        onFilterChange={setFilterState}
        jobCount={filteredJobs.length}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: '1200px' }}>
            <SortableContext items={['unassigned', 'scheduled', 'in_progress', 'completed']} strategy={verticalListSortingStrategy}>
              <DroppableColumn
                id="unassigned"
                title="Unassigned"
                jobs={jobsByStatus.unassigned}
                count={jobsByStatus.unassigned.length}
              />
              <DroppableColumn
                id="scheduled"
                title="Scheduled"
                jobs={jobsByStatus.scheduled}
                count={jobsByStatus.scheduled.length}
              />
              <DroppableColumn
                id="in_progress"
                title="In Progress"
                jobs={jobsByStatus.in_progress}
                count={jobsByStatus.in_progress.length}
              />
              <DroppableColumn
                id="completed"
                title="Completed"
                jobs={jobsByStatus.completed}
                count={jobsByStatus.completed.length}
              />
            </SortableContext>
          </div>
        </div>

        <DragOverlay>
          {activeJob ? (
            <div className={`bg-white rounded-lg shadow-lg p-4 w-[280px] ${getPriorityColor(activeJob.priority)} opacity-90`}>
              <h3 className="font-semibold text-gray-900 mb-2">{activeJob.customerName}</h3>
              <p className="text-sm text-gray-600 truncate">{activeJob.address}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Job Details Modal */}
      <JobDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />
    </>
  );
};

export default JobBoard;
