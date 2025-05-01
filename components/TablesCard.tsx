import React, { useState } from 'react';
import CardWrapper from './CardWrapper';

interface TablesCardProps {
  tables: string[];
  onSelectTable: (tableName: string) => void;
}

const TablesCard: React.FC<TablesCardProps> = ({ tables, onSelectTable }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filter tables based on search term
  const filteredTables = tables.filter(table => 
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  if (tables.length === 0) return null;
  
  return (
    <CardWrapper title="table-card">
      <div className="tables-card-content">
        <div className="table-search">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="search table"
            className="table-search-input"
          />
        </div>
        
        <div className="tables-container">
          {filteredTables.length > 0 ? (
            filteredTables.map(table => (
              <button
                key={table}
                onClick={() => onSelectTable(table)}
                className="table-btn"
              >
                {table}
              </button>
            ))
          ) : (
            <div className="no-tables-found">No matching table</div>
          )}
        </div>
        <p className="helper-text">Click table name to generate sql sample</p>
      </div>
      
      <style jsx>{`
        .tables-card-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .table-search {
          margin-bottom: 0.75rem;
        }
        
        .table-search-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .table-search-input:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.5);
        }
        
        .tables-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          overflow-y: auto;
          max-height: 180px; /* Fixed height for scrollable area */
          padding-right: 0.5rem;
          margin-bottom: 0.75rem;
        }
        
        .no-tables-found {
          width: 100%;
          text-align: center;
          padding: 1rem;
          color: #718096;
          background-color: #f7fafc;
          border-radius: 0.375rem;
          border: 1px dashed #e2e8f0;
        }
      `}</style>
    </CardWrapper>
  );
};

export default TablesCard;