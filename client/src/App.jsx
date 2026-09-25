import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

// Create ONE socket connection
const socket = io('http://localhost:3000');

const emptyForm = {
  name: '',
  age: '',
  phone: '',
};

function App() {
  const [formInputs, setFormInputs] = useState(emptyForm);
  const [crudData, setCrudData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  // Handle input changes
  const handleInput = (event) => {
    const { name, value } = event.target;

    setFormInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // ADD DATA
  // =========================
  const handleSubmit = () => {
    if (!formInputs.name || !formInputs.age || !formInputs.phone) {
      alert('Please fill in all fields');
      return;
    }

    const newData = {
      ...formInputs,
      id: uuidv4(),
    };

    console.log('Adding:', newData);

    socket.emit('addData', newData);

    setFormInputs(emptyForm);
  };

  // =========================
  // SELECT DATA FOR EDITING
  // =========================
  const getEditData = (data) => {
    console.log('Editing:', data);

    setFormInputs({
      id: data.id,
      name: data.name,
      age: data.age,
      phone: data.phone,
    });

    setIsEdit(true);
  };

  // =========================
  // UPDATE DATA
  // =========================
  const handleEdit = () => {
    if (!formInputs.name || !formInputs.age || !formInputs.phone) {
      alert('Please fill in all fields');
      return;
    }

    console.log('Updating:', formInputs);

    // Send existing ID to server
    socket.emit('updateData', formInputs);

    setFormInputs(emptyForm);
    setIsEdit(false);
  };

  // =========================
  // DELETE DATA
  // =========================
  const handleDelete = (id) => {
    console.log('Deleting:', id);

    socket.emit('deleteData', id);
  };

  // =========================
  // CANCEL EDIT
  // =========================
  const handleCancel = () => {
    setFormInputs(emptyForm);
    setIsEdit(false);
  };

  // =========================
  // SOCKET EVENTS
  // =========================
  useEffect(() => {
    // Connection event
    const handleConnect = () => {
      console.log('Connected to server:', socket.id);
    };

    // Receive CRUD data from server
    const handleCrudData = (response) => {
      console.log('Received:', response);

      // Server sends the complete array
      setCrudData(response);
    };

    socket.on('connect', handleConnect);
    socket.on('crudData', handleCrudData);

    // Cleanup listeners
    return () => {
      socket.off('connect', handleConnect);
      socket.off('crudData', handleCrudData);
    };
  }, []);

  return (
    <>
      <div>
        <h1>CRUD Operation</h1>

        <div className="form-fields">
          <input
            type="text"
            name="name"
            onChange={handleInput}
            className="input-field"
            placeholder="Enter your Name"
            value={formInputs.name}
          />

          <input
            type="number"
            name="age"
            onChange={handleInput}
            className="input-field"
            placeholder="Enter your Age"
            value={formInputs.age}
          />

          <input
            type="tel"
            name="phone"
            onChange={handleInput}
            className="input-field"
            placeholder="Enter your Phone Number"
            value={formInputs.phone}
          />

          <button onClick={isEdit ? handleEdit : handleSubmit}>
            {isEdit ? 'Update' : 'Add'} Data
          </button>

          {isEdit && (
            <button onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <table style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Phone Number</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {crudData.map((data) => (
            <tr key={data.id}>
              <td>{data.name}</td>
              <td>{data.age}</td>
              <td>{data.phone}</td>

              <td>
                <button onClick={() => getEditData(data)}>
                  Edit
                </button>

                <button onClick={() => handleDelete(data.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default App;
