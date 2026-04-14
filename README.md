# System Design Visualizer

A modern, interactive web application for designing backend system architectures using drag-and-drop components. Create microservice systems, distributed architectures, cloud infrastructure, and event-driven systems with an intuitive visual interface.

## 🚀 Features

- **Drag-and-Drop Components**: Easily add architecture components to the canvas
- **Interactive Canvas**: Move, zoom, and pan across your architecture design
- **Component Connections**: Draw edges between components to show communication patterns
- **Properties Panel**: Edit component details like name, technology, and description
- **Undo/Redo System**: Easily revert or redo your changes
- **Export Functionality**: Export your architecture diagrams as JSON or PNG
- **Dark Mode**: Toggle between light and dark themes
- **Modern UI**: Clean, intuitive interface built with TailwindCSS

## 🛠️ Architecture Components

- API Server
- Database
- Cache
- Load Balancer
- Message Queue
- Worker
- Storage
- Microservice

## 📋 Tech Stack

- **Next.js 14** - React framework for production
- **React 19** - UI library
- **React Flow** - Graph visualization and interactivity
- **TypeScript** - Static typing
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Lodash** - Utility functions
- **UUID** - Unique ID generation
- **html-to-image** - Export canvas to PNG

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd system-visualizer
npm install

# Also install backend dependencies
cd backend
npm install
cd ..
```

### Development

The system requires both backend and frontend to run:

**Terminal 1 - Start Backend:**
```bash
cd backend

# First time setup only (creates database)
npm run setup

# Start backend server
npm run dev
```

Backend will run on [http://localhost:5000](http://localhost:5000)

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Frontend will run on [http://localhost:3000](http://localhost:3000)

Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # Reusable React components
│   ├── canvas/      # Canvas and palette components
│   ├── nodes/       # Architecture node components
│   ├── edges/       # Connection edge components
│   └── ui/          # UI building blocks
├── hooks/           # Custom React hooks
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and design system

.github/
└── agents/          # Custom VS Code agents
```

## 🎨 Design System

The application uses a modern design system with:

- **Color Palette**: Slate (neutral), Cyan (primary), Amber (accent)
- **Typography**: Clear hierarchy with consistent sizing
- **Spacing**: Standardized spacing scale
- **Components**: Reusable, composable UI components
- **Animations**: Smooth transitions and interactions

## 📖 Usage

1. **Drag components** from the left panel onto the canvas
2. **Connect components** by dragging from one node's output port to another's input
3. **Edit properties** by selecting a component and using the right panel
4. **Save your work** using the Save button in the toolbar
5. **Export** as JSON for storage or PNG for sharing

## 🔐 Security & Testing

Custom agents available for:
- **Integration & Testing**: Unit, integration, and E2E tests
- **Security**: Vulnerability detection and secure coding practices
- **Bug Fixes**: Systematic issue resolution

## 📚 Development Roadmap

- [ ] Phase 1: Project Setup ✓
- [ ] Phase 2: Canvas Implementation ✓
- [ ] Phase 3: Node Drag System (In Progress)
- [ ] Phase 4: Edge Connection System (In Progress)
- [ ] Phase 5: Export Functionality
- [ ] Phase 6: UI Improvements
- [ ] Phase 7: Performance Optimization

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and create pull requests to `main`.

## 📄 License

MIT License - feel free to use this project for personal and commercial purposes.

## 👤 Author

Prince Raj - Computer Science Engineering Student, System Design Enthusiast

---

**Happy Designing! 🎨**
