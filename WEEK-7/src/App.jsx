import './App.css';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import { StudentProvider } from './StudentContext';

function App() {
  return (
    <StudentProvider>
      <div className="container">
        <div className="app-header">
          <h1>📚 Student Management System</h1>
          <p>Manage your students efficiently</p>
        </div>
        
        <div className="main-content">
          <div className="form-section">
            <StudentForm />
          </div>
          
          <div className="list-section">
            <StudentList />
          </div>
        </div>
      </div>
    </StudentProvider>
  );
}

export default App;
