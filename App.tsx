import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import './App.css'
const client = generateClient<Schema>();

function App() {
  const [patients, setPatients] = useState<Array<Schema["Patient"]["type"]>>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Schema["Patient"]["type"]["gender"]>('unknown');
  const [birthDate, setBirthDate] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]); //To track selected patients
  const [searchQuery, setSearchQuery] = useState(''); //New state for search query
  const [filteredPatients, setFilteredPatients] = useState<Array<Schema["Patient"]["type"]>>([]); //State for filtered patients
  const [phoneNumber, setPhoneNumber] = useState('');
  const [active, setActive] = useState(false);
  useEffect(() => {
    const subscription = client.models.Patient.observeQuery().subscribe({
      next: (data) => setPatients([...data.items]),
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = patients.filter((patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gender || !birthDate) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await client.models.Patient.create({
        name,
        gender,
        birthDate,
        // active: true,
        identifiers: [],
        address: [],
        contact: [phoneNumber],
        active,
      });
      setName('');
      setGender('unknown');
      setBirthDate('');
      setShowForm(false); //Hide the form after submission
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("Error creating patient. Please try again.");
    }
  };

  const handleCheckboxChange = (patientId: string) => {
    const updatedSelectedPatients = selectedPatients.includes(patientId)
      ? selectedPatients.filter((id) => id !== patientId) //remove if already selected
      : [...selectedPatients, patientId]; //add if not selected
    setSelectedPatients(updatedSelectedPatients);
  };

  const handleSelectAll = () => {
    setSelectedPatients(patients.map((patient) => patient.id));
  };

  const handleDeselectAll = () => {
    setSelectedPatients([]);
  };

  return (
    <main>
      <nav className="navbar">
        <ul className="navbar-list">
          <li className="navbar-item">
            <a href="#" className="navbar-link">Reports</a>
          </li>
          <li className="navbar-item">
            <a href="#" className="navbar-link">Settings</a>
          </li>
        </ul>
      </nav>
      <h2>Patient Records</h2>
      <div className="search-container"> {/* Added a container for styling */}
        <input
          className="search-bar"
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <img src="/search.svg" alt="Search" className="search-icon" /> {/* Added search icon */}
      </div>
      {/* <button onClick={() => setShowForm(true)}>+ Add New Patient</button> */}
      {showForm && (
        <form onSubmit={handleSubmit}>
          {/* Form content remains the same */}
          <label>
            Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <br />
          <label>
            Gender:
            <select value={gender ?? ''} onChange={(e) => setGender(e.target.value as Schema["Patient"]["type"]["gender"])} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <br />
          <label>
            Birth Date (YYYY-MM-DD):
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
          </label>
          <br />
          <label>
            Phone Number:
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
      Active:
      <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
    </label>
    <br />
          <button type="submit">Add Patient</button>
          <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      <div>
        <button onClick={handleSelectAll}>Select All</button>
        <button onClick={handleDeselectAll}>Deselect All</button>
      </div>

      <ul>
        {filteredPatients.map((patient) => (
          <li key={patient.id} className="patient-list-item">
          <input
            type="checkbox"
            id={patient.id}
            checked={selectedPatients.includes(patient.id)}
            onChange={() => handleCheckboxChange(patient.id)}
          />
          {patient.active ?
          <div className="patient-consent">
          { "AI consent" }
        </div>
        :
        <div className="no-patient-consent">
          { "No AI consent"}
        </div>}
          <div className="patient-info"> {/* Added class for styling */}
            <span className="patient-name">{patient.name}</span>
            {patient.contact?.[0] && <span className="patient-phone">{patient.contact?.[0]}</span>}
          </div>
        </li>
        ))}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'center',  }}> {/* Center the button */}
      <button style={{backgroundColor: '#00FF00', borderRadius: '50%', padding:"0.5em"}}>
        <img src="/phone.svg" alt="" style={{ width: '3em', height: '3em' }}/>
        </button> </div>
    </main>
  );
}

export default App;
