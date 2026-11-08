/**
 * Selector de tareas interactivas (tags neubrutalistas adaptadas por materia escolar)
 * Garantiza que al menos una opción esté seleccionada.
 */

import React from 'react';
import { Check } from 'lucide-react';
import { SelectedTasks, TaskType, SchoolSubjectId } from '../types';
import {
  ALL_TASK_OPTIONS,
  getAvailableTasksForSubject,
  getSubjectById,
} from '../data/schoolSubjects';

interface TaskSelectorProps {
  selectedTasks: SelectedTasks;
  onToggleTask: (task: TaskType) => void;
  subjectId: SchoolSubjectId;
  disabled?: boolean;
}

export const TaskSelector: React.FC<TaskSelectorProps> = ({
  selectedTasks,
  onToggleTask,
  subjectId,
  disabled = false,
}) => {
  const currentSubject = getSubjectById(subjectId);
  const availableTasks = getAvailableTasksForSubject(subjectId);

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span>🎯</span>
          <span>¿Cómo te ayudamos en {currentSubject.shortName}?</span>
        </label>
        <span className="text-[11px] font-medium text-slate-400">
          Elige qué necesitas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {availableTasks.map((taskKey) => {
          const taskInfo = ALL_TASK_OPTIONS[taskKey];
          const isSelected = Boolean(selectedTasks[taskKey]);

          return (
            <button
              key={taskKey}
              type="button"
              onClick={() => onToggleTask(taskKey)}
              disabled={disabled}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer text-left transition-all border ${
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-600 hover:bg-slate-50/50'
              }`}
              aria-pressed={isSelected}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold leading-tight">
                  {taskInfo.title}
                </span>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                  {taskInfo.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
