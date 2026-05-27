import { useState, useEffect } from 'react';
import { supabase, Assignment } from './lib/supabase';
import { Plus, Check, Trash2, Calendar, Flag, X } from 'lucide-react';

function App() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching assignments:', error);
    } else {
      setAssignments(data || []);
    }
    setLoading(false);
  }

  async function addAssignment(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('assignments').insert([formData]);

    if (error) {
      console.error('Error adding assignment:', error);
    } else {
      setFormData({ title: '', description: '', due_date: '', priority: 'medium' });
      setShowForm(false);
      fetchAssignments();
    }
  }

  async function toggleComplete(assignment: Assignment) {
    const { error } = await supabase
      .from('assignments')
      .update({ completed: !assignment.completed })
      .eq('id', assignment.id);

    if (error) {
      console.error('Error updating assignment:', error);
    } else {
      fetchAssignments();
    }
  }

  async function deleteAssignment(id: string) {
    const { error } = await supabase.from('assignments').delete().eq('id', id);

    if (error) {
      console.error('Error deleting assignment:', error);
    } else {
      fetchAssignments();
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getDaysUntil(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  }

  function getCardBorderColor(assignment: Assignment) {
    if (assignment.completed) return 'border-l-green-500';
    if (assignment.priority === 'high') return 'border-l-red-500';
    if (assignment.priority === 'medium') return 'border-l-yellow-500';
    return 'border-l-blue-500';
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Assignment Planner</h1>
              <p className="text-zinc-400 text-sm mt-1">
                {assignments.filter((a) => !a.completed).length} tasks remaining
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-zinc-100 text-zinc-900 px-4 py-2.5 rounded-lg font-medium hover:bg-white transition-colors flex items-center gap-2"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? 'Cancel' : 'Add Assignment'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Add Form */}
        {showForm && (
          <form
            onSubmit={addAssignment}
            className="mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6"
          >
            <h2 className="text-lg font-medium mb-4">New Assignment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-500 placeholder-zinc-500"
                  placeholder="Assignment title..."
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-500 placeholder-zinc-500 resize-none"
                  rows={2}
                  placeholder="Add details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as 'low' | 'medium' | 'high',
                      })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-500 transition-colors"
              >
                Create Assignment
              </button>
            </div>
          </form>
        )}

        {/* Assignments List */}
        {loading ? (
          <div className="text-center py-12 text-zinc-400">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-zinc-600" />
            </div>
            <p className="text-zinc-400">No assignments yet</p>
            <p className="text-zinc-500 text-sm mt-1">Add your first assignment to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const daysUntil = getDaysUntil(assignment.due_date);
              const isOverdue = daysUntil < 0 && !assignment.completed;

              return (
                <div
                  key={assignment.id}
                  className={`bg-zinc-900 border border-zinc-800 border-l-4 ${getCardBorderColor(
                    assignment
                  )} rounded-lg p-5 hover:bg-zinc-800/50 transition-colors ${
                    assignment.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Complete Button */}
                    <button
                      onClick={() => toggleComplete(assignment)}
                      className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        assignment.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      {assignment.completed && <Check size={14} className="text-white" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3
                            className={`font-medium ${
                              assignment.completed ? 'line-through text-zinc-500' : ''
                            }`}
                          >
                            {assignment.title}
                          </h3>
                          {assignment.description && (
                            <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
                              {assignment.description}
                            </p>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteAssignment(assignment.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-3">
                        <span
                          className={`flex items-center gap-1.5 text-sm ${
                            isOverdue ? 'text-red-400' : 'text-zinc-400'
                          }`}
                        >
                          <Calendar size={14} />
                          {formatDate(assignment.due_date)}
                          {isOverdue && (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                              {Math.abs(daysUntil)}d overdue
                            </span>
                          )}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm ${getPriorityColor(assignment.priority)}`}>
                          <Flag size={14} />
                          {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
