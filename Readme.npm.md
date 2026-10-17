## JSON Tree Visualizer

React based JSON visualizer helps to render the whole as nodes and edges

### Installation

```bash
npm install react-json-tree-visualizer
```

Requires `react` and `react-dom` 18 or newer.

### Basic usage

```tsx
import { JsonRenderer } from 'react-json-tree-visualizer';

const data = {
    name: 'Ada',
    roles: ['admin', 'editor'],
    address: { city: 'London', zip: 'NW1' },
};

export default function App() {
    return (
        <div style={{ width: '100%', height: '600px' }}>
            <JsonRenderer jsonData={JSON.stringify(data)} />
        </div>
    );
}
```

- `jsonData` takes a JSON **string**, so pass objects through `JSON.stringify` first.
- The renderer fills its parent element. Give the parent an explicit height.
- If the string is not valid JSON, the canvas shows an empty state instead of throwing an error.
- The component is marked `'use client'`, so you can use it directly in the Next.js App Router.

### Options

Every option is optional. Anything you leave out falls back to `DEFAULT_OPTIONS`, and `zoom` and `colors` merge key by key.

```tsx
<JsonRenderer
    jsonData={json}
    options={{
        nodeWidth: 280,
        levelGap: 120,
        showFps: true,
        zoom: { min: 0.2, max: 4 },
        colors: {
            background: '#ffffff',
            gridDot: '#e4e4e7',
            nodeBody: '#fafafa',
            nodeHeader: '#f4f4f5',
            nodeBorder: '#d4d4d8',
            title: '#18181b',
            value: '#3f3f46',
            edge: '#a1a1aa',
        },
    }}
/>
```