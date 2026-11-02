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
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-[#A8E6CF] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs font-black text-[#1A1A1A] shrink-0">
            PASO 3
          </span>
          <label className="text-sm sm:text-base font-black text-[#1A1A1A]">
            ¿Cómo quieres que te ayude en {currentSubject.shortName}?
          </label>
        </div>
        <span className="text-[11px] font-bold text-[#1A1A1A]/65">
          Puedes marcar una o varias opciones
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {availableTasks.map((taskKey) => {
          const taskInfo = ALL_TASK_OPTIONS[taskKey];
          const isSelected = Boolean(selectedTasks[taskKey]);

          return (
            <button
              key={taskKey}
              type="button"
              onClick={() => onToggleTask(taskKey)}
              disabled={disabled}
              className={`neo-tag-btn flex items-start gap-3 p-3.5 rounded-xl cursor-pointer text-left transition-all h-full ${
                isSelected
                  ? 'border-[#1A1A1A] text-[#1A1A1A] scale-[1.01]'
                  : 'bg-white border-[#1A1A1A] text-[#1A1A1A]/75 hover:bg-[#FAF7EE]'
              }`}
              style={{
                backgroundColor: isSelected ? taskInfo.color : '#FFFFFF',
              }}
              aria-pressed={isSelected}
            >
              <div
                className={`w-6 h-6 rounded-lg border-2 border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected ? 'bg-[#1A1A1A] text-white' : 'bg-white'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-sm font-black text-[#1A1A1A] leading-snug">
                  {taskInfo.title}
                </span>
                <p className="text-[11px] sm:text-xs font-medium text-[#1A1A1A]/85 leading-relaxed mt-1">
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
