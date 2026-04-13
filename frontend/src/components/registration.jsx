import { useState } from "react";

const RegisterForm = () => {
  const [role, setRole] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");

  const municipalities = ["Boac", "Gasan", "Mogpog", "Santa Cruz", "Torrijos", "Buenavista"];
  const barangays = {
    Boac: ["Cawit", "Isok", "Bagumbayan"],
    Gasan: ["Talon", "Buenavista"],
    Mogpog: ["Barangay A", "Barangay B"],
    SantaCruz: ["Barangay X", "Barangay Y"],
    Torrijos: ["Barangay 1", "Barangay 2"],
    Buenavista: ["Barangay Alpha", "Barangay Beta"]
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // send data to backend API
    console.log({ role, municipality, barangay });
  };

  return (
    <form onSubmit={handleSubmit} className="register-form" style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <input type="text" placeholder="Name" required />
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />

      <select value={role} onChange={e => setRole(e.target.value)} required>
        <option value="">Select Role</option>
        <option value="member">Member</option>
        <option value="barangay">Barangay Official</option>
        <option value="municipal">Municipal Officer</option>
      </select>

      {role === "municipal" && (
        <select value={municipality} onChange={e => setMunicipality(e.target.value)} required>
          <option value="">Select Municipality</option>
          {municipalities.map(m => <option key={m}>{m}</option>)}
        </select>
      )}

      {role === "barangay" && (
        <>
          <select value={municipality} onChange={e => setMunicipality(e.target.value)} required>
            <option value="">Select Municipality</option>
            {municipalities.map(m => <option key={m}>{m}</option>)}
          </select>

          <select
            value={barangay}
            onChange={e => setBarangay(e.target.value)}
            disabled={!municipality}
            required
          >
            <option value="">Select Barangay</option>
            {municipality && barangays[municipality].map(b => <option key={b}>{b}</option>)}
          </select>
        </>
      )}

      <button type="submit" className="btn-primary">Sign Up</button>
    </form>
  );
};

export default RegisterForm;