import { useContext } from 'react';
import { StudentContext } from '../StudentContext';
import './StudentList.css';

const StudentList = () => {
  const { students, removeStudent } = useContext(StudentContext);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      removeStudent(id);
    }
  };

  return (
    <div className="student-list">
      <h2 className="section-title">Students</h2>
      
      {students.length === 0 ? (
        <p className="no-students">No students added yet. Add a student to get started!</p>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roll Number</th>
              <th>Grade</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.rollNumber}</td>
                <td>{student.grade}</td>
                <td>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentList;
