import React, { useState, useEffect } from 'react';

import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';

import ControlForm from '../components/ControlForm';

import ApiManager from '../api/ApiManager';

function ControlCard({ table, setTable, tables, fields, onSelectQuery }) {
  const [ tableOptions, setTableOptions ] = useState([]); // Option[]
  const [ tableValue, setTableValue ] = useState(undefined); // Option
  const [ tableForm, setTableForm ] = useState({});

  useEffect(() => {
    const options = tables.map(el => ({ name: el }));
    setTableOptions(options);
  }, [tables]);

  const getFormParams = () => Object.keys(tableForm).map(key => ({ name: key, value: tableForm[key].value })).filter(el => !!el.value);

  const searchTable = () => {
    let filteredTables = [...tables];
    if (tableValue && tableValue.name.trim()) filteredTables = tables.filter(el => el.includes(tableValue.name));
    const filteredOptions = filteredTables.map(el => ({ name: el }));
    setTableOptions(filteredOptions);
  };

  const handleTableInputChange = async (e) => {
    // console.log('ControlCard.handleTableInputChange Event =', e);

    let { value } = e;
    if (typeof value === "string") value = value.toLowerCase();
    if (typeof value !== "string") value = value.name;

    setTableValue({ name: value });

    if (tables.includes(value)) {
      // console.log('ControlCard.handleTableInputChange: Valid table entered!');
      setTable(value);
    }
  };

  const handleQueryClick = async () => {
    console.log('ControlCard.handleQueryClick invoked', );

    try {
      const formParams = getFormParams();
      const params = { table, fields: formParams };
      const rows = await ApiManager.getSelectQuery(params);
      const id = crypto.randomUUID().substring(0, 6);
      const result = { id, table, formParams, fields, rows };
      onSelectQuery(result);
    } catch (err) {
      console.error('ControlCard.handleQueryClick: getSelectQuery failed! Error =', err);
    }
  };

  const formProps = { fields, tableForm, setTableForm };

  return (
    <div className="card" style={{ width: '100%' }}>
      <AutoComplete
        dropdown
        value={tableValue}
        suggestions={tableOptions}
        field="name"
        onChange={handleTableInputChange}
        completeMethod={searchTable}
      />

      <div className="spacer" />

      {
        table ?
        <div className='p400' style={{ marginBottom: '0.5rem' }}>Showing controls for <span className='p600'>{table}</span> table</div>
        : <div className='p400'>No table selected</div>
      }

      {
        Array.isArray(fields) ? (
          <ControlForm {...formProps} />
        ) : (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <></>
        )
      }

      <div className="spacer" />

      <div>
        <Button
          label="Query"
          onClick={handleQueryClick}
          disabled={!table}
          className="p-button-success"
          style={{ marginRight: '10px' }}
        />
        <Button
          label="Add"
          style={{ marginRight: '10px' }}
          disabled={!table}  
        />
      </div>
    </div>
  );
}

export default ControlCard;
