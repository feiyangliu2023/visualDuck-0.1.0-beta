import React from 'react';
import CardWrapper from './CardWrapper';

interface DataPreviewProps {
  data: any[] | null;
  tableName: string | null;
  isLoading: boolean;
  error: string | null;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, tableName, isLoading, error }) => {
  if (!data || data.length === 0) {
    return (
      <CardWrapper title="Data preview">
        <div className="no-data-message">
          {isLoading ? 'loading...' : error ? `error: ${error}` : 'select a table to preview data'}
        </div>
      </CardWrapper>
    );
  }

  // Get column names from first row
  const columns = Object.keys(data[0]);

  return (
    <CardWrapper title={`data preview: ${tableName}`}>
      <div className="data-preview-container">
        <div className="data-preview-info">
          <span className="preview-count">{data.length} row data</span>
          <span className="preview-count">{columns.length} column</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={`${rowIndex}-${colIndex}`}>{String(row[column])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 10 && (
            <div className="more-data-note">
              Showing 10 lines of data, totally {data.length} lines
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
};

export default DataPreview;