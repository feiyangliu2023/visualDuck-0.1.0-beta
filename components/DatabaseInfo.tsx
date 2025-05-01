import React from 'react';
import { DatabaseInfo as DatabaseInfoType } from './types';
import CardWrapper from './CardWrapper';

interface DatabaseInfoProps {
  databaseInfo: DatabaseInfoType;
  onOpenDatabase: () => void;
  isLoading: boolean;
}

const DatabaseInfo: React.FC<DatabaseInfoProps> = ({ databaseInfo, onOpenDatabase, isLoading }) => {
  return (
    <CardWrapper title="database info">
      <div className="database-info-content">
        <div className="database-info">
          <button 
            className="btn primary-btn"
            onClick={onOpenDatabase}
            disabled={isLoading}
          >
            Select database file
          </button>
          <div className="info-item">
            <span className="info-label">Current database:</span>
            <span className="info-value">{databaseInfo.path === ':memory:' ? 'memory database(demo)' : databaseInfo.path}</span>
          </div>
          <div className="info-item">
            <span className="info-label">connection status:</span>
            <span className={`connection-status ${databaseInfo.connected ? 'connected' : 'disconnected'}`}>
              {databaseInfo.connected ? 'connected' : 'disconnected'}
            </span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .database-info-content {
          /* Match the height with TablesCard */
          min-height: 245px; /* This height accounts for the content plus padding in the card */
          display: flex;
          flex-direction: column;
        }
        
        .database-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }
        
        .info-item {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .info-value {
          word-break: break-all;
        }
        
        /* Button is now at the top - no need for margin-top: auto */
        .primary-btn {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </CardWrapper>
  );
};

export default DatabaseInfo;