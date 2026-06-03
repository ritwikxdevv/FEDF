import { useContext, useState } from 'react';
import { StudentContext } from '../StudentContext';
import './StudentForm.css';

const StudentForm = () => {
  const { addStudent } = useContext(StudentContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    grade: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.rollNumber && formData.grade) {
      addStudent(formData);
      setFormData({ name: '', email: '', rollNumber: '', grade: '' });
      alert('Student added successfully!');
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      <h2 className="section-title">Add Student</h2>
      
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter student name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter student email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="rollNumber">Roll Number</label>
        <input
          type="text"
          id="rollNumber"
          name="rollNumber"
          value={formData.rollNumber}
          onChange={handleChange}
          placeholder="Enter roll number"
        />
      </div>

      <div className="form-group">
        <label htmlFor="grade">Grade</label>
        <select
          id="grade"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
        >
          <option value="">Select a grade</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
      </div>

      <button type="submit" className="submit-btn">Add Student</button>
    </form>
  );
};

export default StudentForm;
