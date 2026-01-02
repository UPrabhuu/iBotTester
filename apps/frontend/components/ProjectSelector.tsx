import React from 'react';
import { Project } from '@/types/project';
import { Button, Text, Badge, Select } from './ui';

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
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Project Selector */}
        <div className="flex items-center space-x-4">
          <Select
            value={selectedProject.id}
            onChange={(e) => onProjectChange(e.target.value)}
            label="Project"
            size="md"
            fullWidth={false}
            className="min-w-[200px]"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>

          {/* Branch Selector */}
          <Select
            value={selectedProject.currentBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            label="Branch"
            size="md"
            fullWidth={false}
            className="min-w-[200px]"
          >
            {selectedProject.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
                {branch.isDefault ? ' (default)' : ''}
              </option>
            ))}
          </Select>
        </div>
                  className="w-4 h-4 text-neutral-500"
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
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                🌿
              </span>
            </div>
          </div>
        </div>

        {/* Project Description */}
        {selectedProject.description && (
          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
            {selectedProject.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelector;
