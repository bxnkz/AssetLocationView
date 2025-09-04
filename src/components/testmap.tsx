// src/components/CompanyMap.tsx
import React from 'react';
import Draggable from 'react-draggable';
import './index.css';

const CompanyMap: React.FC = () => {
  return (
    <div style={{ position: 'relative', width: '1000px', height: '700px', border: '1px solid #ccc' }}>
      {/* รูปแผนผัง */}
      <img
        src="/images/tips.jpg"
        alt="Office Layout"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      />

      {/* Object ที่ลากได้ */}
      <Draggable>
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
            background: 'rgba(0, 123, 255, 0.8)',
            padding: '8px 12px',
            borderRadius: '8px',
            color: 'white',
            cursor: 'move'
          }}
        >
          แผนกบัญชี
        </div>
      </Draggable>

      <Draggable>
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
            background: 'rgba(40, 167, 69, 0.8)',
            padding: '8px 12px',
            borderRadius: '8px',
            color: 'white',
            cursor: 'move'
          }}
        >
          แผนก IT
        </div>
      </Draggable>
    </div>
  );
};

export default CompanyMap;
