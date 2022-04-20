import React, { useMemo } from 'react';

import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
// import { Chart } from 'primereact/chart';

function TasksComponent({ tasks, taskFields }) {
  const renderedColumns = useMemo(() => {
    if (!(Array.isArray(taskFields) && taskFields.length !== 0)) return null;
    return taskFields.map((field) => (
      <Column field={field.name} header={field.name} key={field.name} />
    ));
  }, [taskFields]);

  if (!tasks || !tasks.length) return null;

  return (
    <>
      <DataTable responsiveLayout="scroll" value={tasks}>
        {renderedColumns}
      </DataTable>
    </>
  )
}

function ProjectComponent({ project, taskFields }) {
  if (!project) return null;
  const { tasks } = project;
  const tasksText = tasks.length ? `Tasks (${tasks.length}):` : 'No tasks in project';
  return (
    <>
      <div className='project-row'>
        <div style={{ width: 'fit-content' }}>
          <div className='bold'>{project.Title}</div>
          <div>ID: {project.ID}</div>
          <div>Actual Cost: ${project.ActualCost}</div>
          <div>Estimated Cost: ${project.EstimatedCost}</div>
          <div>Actual Effort: {project.ActualEffort}</div>
          <div>Department: {project.Department}</div>
          <div>Created By: {project.CreatedBy}</div>
          <div className='spacer'/>
          <div className='bold'>{tasksText}</div>
        </div>
        <div>
          <div className='fake-chart' />
        </div>
      </div>
      <TasksComponent tasks={tasks} taskFields={taskFields} />
    </>
  );
}

function WorkspaceComponent({ workspace, taskFields }) {
  if (!workspace) return null;
  return (
    <>
      <div className='workspace-row'>
        <div>
          <div className='bold'>{workspace.Title}</div>
          <div>ID: {workspace.ID}</div>
          <div>Actual Cost: ${workspace.ActualCost}</div>
          <div>Actual Effort: ${workspace.ActualEffort}</div>
          <div>Created By: {workspace.CreatedBy}</div>
          <div className='spacer'/>
          <div className='bold'>Projects ({workspace.projects.length}):</div>
        </div>
        <div>
          <div className='fake-chart'/>
        </div>
      </div>
      { workspace.projects.map(project => <ProjectComponent key={`project-row-${project.ID}`} project={project} taskFields={taskFields} />) }
    </>
  );
}

function ReportSummaryCard({ result, onRemove }) {  
  if (!result) return null;

  const { params, report } = result;
  const { workspaces, taskFields, requestedBy, requestedAt } = report;

  const handleExportClick = () => {};

  const onRemoveClick = () => {
    onRemove(result.id);
  };

  const renderDescription = () => {
    const workspacesSelected = params.workspaceTitles.join(',') || 'All workspaces';
    const projectsSelected = params.projectTitles.join(',') || 'All projects';
    const requestedAtText = new Date(requestedAt).toISOString();
    return (
      <>
        <div>Workspaces Selected: {workspacesSelected}</div>
        <div>Projects Selected: {projectsSelected}</div>
        <div>Requested by {requestedBy.FirstName} {requestedBy.LastName}</div>
        <div>Requested at {requestedAtText}</div>
      </>
    );
  };

  return (
    <div className="card" style={{ width: '100%', marginTop: '1rem' }}>
      <div className="flex space-between">
        <div className="h600">Report {result.id}</div>
        <div>
          <Button label="Export" onClick={handleExportClick} style={{ marginRight: '10px' }} />
          <Button
            onClick={onRemoveClick}
            icon="pi pi-times"
            className="p-button-rounded p-button-secondary p-button-outlined"
          />
        </div>
      </div>
      {renderDescription()}
      <div className='spacer' />
      {workspaces.map(workspace => <WorkspaceComponent key={`workspace-row-${workspace.ID}`} workspace={workspace} taskFields={taskFields} />)}
    </div>
  );
}

export default ReportSummaryCard;
