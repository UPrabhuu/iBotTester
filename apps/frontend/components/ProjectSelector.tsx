import React from 'react';
import { Project } from '@/types/project';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: Project;
  onProjectChange: (projectId: string) => void;
  onBranchChange: (branchId: string) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProject,
  onProjectChange,
  onBranchChange,
}) => {

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Project Selector */}
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
              Project
            </label>
            <select
              value={selectedProject.id}
              onChange={(e) => onProjectChange(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 font-semibold cursor-pointer hover:border-slate-400 transition-colors"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
              Branch
            </label>
            <div className="relative">
              <select
                value={selectedProject.currentBranch}
                onChange={(e) => onBranchChange(e.target.value)}
                className="pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 font-medium cursor-pointer hover:border-slate-400 transition-colors appearance-none"
              >
                {selectedProject.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                    {branch.isDefault ? ' (default)' : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {/* Git branch icon */}
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                🌿
              </span>
            </div>
          </div>
        </div>

        {/* Project Description */}
        {selectedProject.description && (
          <div className="text-sm text-slate-600 max-w-md">
            {selectedProject.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelector;
