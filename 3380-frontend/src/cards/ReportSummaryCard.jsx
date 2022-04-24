/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { ResponsivePie } from '@nivo/pie';

import ApiManager from '../api/ApiManager';

function getActualCostStyle(obj) {
  if (obj.ActualCost <= obj.EstimatedCost) { 
    return 'below-estimated';
  }
  return 'above-estimated';
}

function PieChart({ data, height = 100 }) {
  if (!data.length) return null;
  return (
    <div className='chart-container' style={{ height: `${height}px` }}>
      <ResponsivePie
        data={data}
        borderWidth={1}
        margin={{ top: 10, right: 10, bottom: 10, left: 160 }}
        enableArcLinkLabels={false}
        legends={[
          {
              anchor: 'left',
              direction: 'column',
              justify: false,
              translateX: -150,
              translateY: 0,
              itemWidth: 100,
              itemHeight: 20,
              itemsSpacing: 5,
              symbolSize: 18,
              symbolShape: 'circle',
              itemDirection: 'left-to-right'
          }
        ]}
      />
    </div>
  );
}

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
  const [display, setDisplay] = useState(true);
  if (!project) return null;
  
  const onDivClick = () => {
    setDisplay(!display);
  }

  const renderTasks = (tasks) => {
    if (!display) return null;
    return <TasksComponent tasks={tasks} taskFields={taskFields} />;
  }

  const { tasks } = project;
  const data = tasks.map(task => ({ id: task.ID, label: task.Title, value: task.ActualCost }));
  const tasksText = tasks.length ? `Tasks (${tasks.length})` : 'No tasks in project';
  const departmentText = project.Department || 'Not assigned';

  return (
    <>
      <div className='project-row' onClick={onDivClick}>
        <div style={{ width: 'fit-content' }}>
          <div className='bold'>{project.Title}</div>
          <div>ID: {project.ID}</div>
          <div className='flex align-center'>Actual Cost: <div className={getActualCostStyle(project)}>${project.ActualCost}</div></div>
          <div>Estimated Cost: ${project.EstimatedCost}</div>
          <div>Actual Effort: {project.ActualEffort}</div>
          <div>Department: {departmentText}</div>
          <div>Created By: {project.CreatedBy}</div>
          <div className='spacer'/>
          <div className='bold'>{tasksText}</div>
        </div>
        <PieChart data={data} height={180} />
      </div>
      {renderTasks(tasks)}
    </>
  );
}

function WorkspaceComponent({ workspace, taskFields }) {
  const [display, setDisplay] = useState(true);
  if (!workspace) return null;

  const onDivClick = () => {
    setDisplay(!display);
  }

  const renderWorkspaces = () => {
    if (!display) return null;
    return workspace.projects.map(project => <ProjectComponent key={`project-row-${project.ID}`} project={project} taskFields={taskFields} />);
  }
  
  const data = workspace.projects.map(project => ({ id: project.ID, label: project.Title, value: project.ActualCost }));
  const projectsText = workspace.projects.length ? `Projects (${workspace.projects.length})` : 'No projects in workspace';
  
  return (
    <>
      <div className='workspace-row' onClick={onDivClick}>
        <div>
          <div className='bold'>{workspace.Title}</div>
          <div>ID: {workspace.ID}</div>
          <div className='flex align-center'>
            Actual Cost:
            <div className={getActualCostStyle(workspace)}>${workspace.ActualCost}</div>
          </div>
          <div>Actual Effort: {workspace.ActualEffort}</div>
          <div>Created By: {workspace.CreatedBy}</div>
          <div className='spacer'/>
          <div className='bold'>{projectsText}</div>
        </div>
        <PieChart data={data} height={140} />
      </div>
      {renderWorkspaces()}
    </>
  );
}

function ReportSummaryCard({ result, onRemove }) {
  const [report, setReport] = useState({ workspaces: [], taskFields: [], numWorkspaces: 0, numProjects: 0, numTasks: 0, requestedBy: 0, requestedAt: 0 });

  const { id, params, workspaceTitles, projectTitles } = result;
  const { workspaces, taskFields, numWorkspaces, numProjects, numTasks, requestedBy, requestedAt } = report;

  const getData = useCallback(
    async () => {
      ApiManager.getReport(params)
      .then(reportData => { setReport(reportData); })
      .catch(() => { console.log('ReportSummaryCard.getData: Failed to load'); });
    }, [params]
  );

  useEffect(() => {
    getData();
  }, [getData]);

  const handleExportClick = () => {};

  const onRemoveClick = () => {
    onRemove(result.id);
  };

  const renderDescription = () => {
    const requestedByText = requestedBy ? `${requestedBy.FirstName} ${requestedBy.LastName}` : 'Nykolas';
    const workspacesSelected = workspaceTitles.join(', ') || 'All workspaces';
    const projectsSelected = projectTitles.join(', ') || 'All projects';
    const requestedAtText = new Date(requestedAt).toISOString();
    return (
      <>
        <div>Workspaces Selected: {workspacesSelected}</div>
        <div>Projects Selected: {projectsSelected}</div>
        <div>Requested at {requestedAtText}</div>
        <div>Requested by {requestedByText}</div>
      </>
    );
  };

  return (
    <div className="card" style={{ width: '100%', marginTop: '1rem' }}>
      <div className="flex space-between">
        <div className="h600">Report {id}</div>
        <div>
          <Button label="Export" onClick={handleExportClick} style={{ marginRight: '10px' }} />
          <Button label="Refresh" onClick={getData} style={{ marginRight: '10px' }} className="p-button-secondary" />
          <Button
            onClick={onRemoveClick}
            icon="pi pi-times"
            className="p-button-rounded p-button-secondary p-button-outlined"
          />
        </div>
      </div>

      {renderDescription()}

      <div className='spacer' />

      <div>Number of Workspaces: {numWorkspaces}</div>
      <div>Number of Projects: {numProjects}</div>
      <div>Number of Tasks: {numTasks}</div>

      <div className='spacer' />
      
      <div style={{ maxHeight: '600px', overflow: 'auto'}}>
        {workspaces.map(workspace => <WorkspaceComponent key={`workspace-row-${workspace.ID}`} workspace={workspace} taskFields={taskFields} />)}
      </div>
    </div>
  );
}

export default ReportSummaryCard;
