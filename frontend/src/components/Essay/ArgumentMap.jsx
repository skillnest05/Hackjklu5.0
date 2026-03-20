import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node Component for our Argument Map
const CustomNode = ({ data, type }) => {
  // Determine color based on the label/type
  let nodeStyle = { borderColor: 'var(--accent-primary)', backgroundColor: 'rgba(108,99,255,0.1)' };
  let badgeStyle = { color: 'var(--accent-primary)', backgroundColor: 'rgba(108,99,255,0.2)' };
  
  if (data.label && data.label.toLowerCase().includes('thesis')) {
    nodeStyle = { borderColor: 'var(--accent-secondary)', backgroundColor: 'rgba(0,212,255,0.1)' };
    badgeStyle = { color: 'var(--accent-secondary)', backgroundColor: 'rgba(0,212,255,0.2)' };
  } else if (data.label && data.label.toLowerCase().includes('claim')) {
    nodeStyle = { borderColor: 'var(--accent-warning)', backgroundColor: 'rgba(255,179,71,0.1)' };
    badgeStyle = { color: 'var(--accent-warning)', backgroundColor: 'rgba(255,179,71,0.2)' };
  } else if (data.label && data.label.toLowerCase().includes('evidence')) {
    nodeStyle = { borderColor: 'var(--accent-success)', backgroundColor: 'rgba(0,229,160,0.1)' };
    badgeStyle = { color: 'var(--accent-success)', backgroundColor: 'rgba(0,229,160,0.2)' };
  } else if (data.label && data.label.toLowerCase().includes('counter')) {
    nodeStyle = { borderColor: 'var(--accent-danger)', backgroundColor: 'rgba(255,77,77,0.1)' };
    badgeStyle = { color: 'var(--accent-danger)', backgroundColor: 'rgba(255,77,77,0.2)' };
  } else if (data.label && data.label.toLowerCase().includes('conclusion')) {
    nodeStyle = { borderColor: '#c084fc', backgroundColor: 'rgba(192,132,252,0.1)' };
    badgeStyle = { color: '#c084fc', backgroundColor: 'rgba(192,132,252,0.2)' };
  }

  return (
    <div 
      className="glass" 
      style={{ 
        padding: '16px', 
        borderRadius: '12px', 
        borderWidth: '2px', 
        borderStyle: 'solid',
        width: '256px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
        transition: 'transform 0.2s',
        ...nodeStyle
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ width: '12px', height: '12px', backgroundColor: 'white', border: '2px solid #1e293b' }} 
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ 
            fontSize: '10px', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            padding: '4px 8px', 
            borderRadius: '9999px', 
            ...badgeStyle 
          }}>
            {data.label}
          </span>
        </div>
        <p style={{ fontSize: '14px', color: '#e5e7eb', lineHeight: '1.375', margin: 0 }}>{data.text}</p>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ width: '12px', height: '12px', backgroundColor: 'white', border: '2px solid #1e293b' }} 
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const ArgumentMap = ({ argumentMapData }) => {
  // Parse incoming argument map data or use empty defaults
  const initialNodes = argumentMapData?.nodes || [];
  const initialEdges = argumentMapData?.edges || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  if (!nodes || nodes.length === 0) {
    return (
      <div 
        className="glass" 
        style={{ height: '500px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}
      >
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No argument structure detected for this essay.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="glass" 
      style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glass)', position: 'relative' }}
    >
      <style>
        {`
          .react-flow__controls-button {
            background-color: var(--bg-card) !important;
            fill: var(--text-primary) !important;
            border-bottom: 1px solid var(--border-glass) !important;
          }
          .react-flow__controls-button:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
          }
          .react-flow__attribution {
            display: none !important;
          }
        `}
      </style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: '#0a0a1a' }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-glass)' }} />
        <Background variant="dots" gap={12} size={1} color="rgba(255, 255, 255, 0.05)" />
      </ReactFlow>
    </div>
  );
};

export default ArgumentMap;
