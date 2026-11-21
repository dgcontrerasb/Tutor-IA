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
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span>🎯</span>
          <span>Ayuda en {currentSubject.shortName}</span>
        </label>
        <span className="text-[11px] font-medium text-slate-400">
          Elige 1 o más
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTasks.map((taskKey) => {
          const taskInfo = ALL_TASK_OPTIONS[taskKey];
          const isSelected = Boolean(selectedTasks[taskKey]);

          return (
            <button
              key={taskKey}
              type="button"
              onClick={() => onToggleTask(taskKey)}
              disabled={disabled}
              title={taskInfo.subtitle}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-left transition-all border ${
                isSelected
                  ? 'bg-blue-50 border-blue-300 text-blue-950 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-white'
              }`}
              aria-pressed={isSelected}
            >
              <span
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
              </span>
              <span className="text-xs font-bold leading-snug">
                {taskInfo.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
