# Student Management System

A React application for managing student records using React Context API for state management.

## Project Structure

```
src/
├── components/
│   ├── StudentForm.jsx      # Form component for adding students
│   ├── StudentForm.css
│   ├── StudentList.jsx      # Component to display student list
│   └── StudentList.css
├── App.jsx                  # Main application component
├── App.css                  # Application styles
├── StudentContext.jsx       # React Context for state management
├── main.jsx                 # Application entry point
└── index.css                # Global styles
```

## Features

- ✅ Add new students with name, email, roll number, and grade
- ✅ View all students in a table format
- ✅ Delete students from the list
- ✅ State management using React Context API
- ✅ Responsive design for mobile and desktop

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Create a production build:
```bash
npm run build
```

## Preview

Preview the production build:
```bash
npm run preview
```

## Technologies Used

- React 18.2.0
- Vite 4.3.9
- React Context API for state management

## License

MIT
