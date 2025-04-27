import React, { useState } from "react";
import "./signup.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(""); // Local state for role selection
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: selectedRole.toUpperCase(),
    isTravelNurse: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(formData.email)) {
      setErrorMessage("Invalid email format");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    const bodyData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: selectedRole.toUpperCase(),
      isTravelNurse: selectedRole === "Nurse" ? formData.isTravelNurse : undefined
    };

    console.log("Form Data Submitted:", bodyData);

    try {
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("Signup Successful! Redirecting to login page...");
      // Redirect to signin page after successful signup
      setTimeout(() => {
        navigate("/signin");
      }, 1500); // Short delay to show the alert
    } catch (error) {
      console.error("Error during fetch:", error);
      alert(`Signup failed: ${error.message}`);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setErrorMessage("");
  };

  return (
      <div className="signup-container">
        <h2 className="signup-title">Sign Up</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-group">
              <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control password-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
              />
              <div className="input-group-append">
              <span
                  className="input-group-text password-toggle-btn"
                  onClick={toggleShowPassword}
              >
                <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </span>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group role-selection">
            <label className="role-label">Select Role:</label>
            <div className="role-options">
              <label>
                <input
                    type="radio"
                    value="Nurse"
                    checked={selectedRole === "Nurse"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                />
                Nurse
              </label>
              <label>
                <input
                    type="radio"
                    value="Hospital"
                    checked={selectedRole === "Hospital"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                />
                Hospital
              </label>
              <label>
                <input
                    type="radio"
                    value="Individual"
                    checked={selectedRole === "Individual"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                />
                Individual
              </label>
            </div>
          </div>

          {/* Nurse-Specific Fields */}
          {selectedRole === "Nurse" && (
              <>
                <div className="form-group">
                  <label>Certifications</label>
                  <select className="form-control">
                    <option value="">Select Certification</option>
                    <option value="RN">Registered Nurse (RN) License</option>
                    <option value="BLS">Basic Life Support (BLS)</option>
                    <option value="ACLS">Advanced Cardiac Life Support (ACLS)</option>
                    <option value="PALS">Pediatric Advanced Life Support (PALS)</option>
                    <option value="NRP">Neonatal Resuscitation Program (NRP)</option>
                    <option value="CEN">Certified Emergency Nurse (CEN)</option>
                    <option value="TNCC">Trauma Nursing Core Course (TNCC)</option>
                    <option value="CCRN">Critical Care Registered Nurse (CCRN)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nursing Specialty</label>
                  <select className="form-control">
                    <option value="">Select Specialty Certification</option>
                    <option value="ENPC">Emergency Nurse Pediatric Course (ENPC)</option>
                    <option value="CPN">Certified Pediatric Nurse (CPN)</option>
                    <option value="OCN">Oncology Certified Nurse (OCN)</option>
                    <option value="CCRN-ICU">Certified ICU Nurse (CCRN-ICU)</option>
                    <option value="CNOR">Certified Operating Room Nurse (CNOR)</option>
                    <option value="CRNA">Certified Registered Nurse Anesthetist (CRNA)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <div className="travel-nurse-checkbox">
                    <input
                      type="checkbox"
                      id="isTravelNurse"
                      name="isTravelNurse"
                      checked={formData.isTravelNurse}
                      onChange={(e) => setFormData({
                        ...formData,
                        isTravelNurse: e.target.checked
                      })}
                    />
                    <label htmlFor="isTravelNurse">
                      I am a Travel Nurse
                    </label>
                  </div>
                </div>
              </>
          )}

          {/* Hospital-Specific Fields */}
          {selectedRole === "Hospital" && (
              <>
                <div className="form-group">
                  <label>Hiring Department</label>
                  <select className="form-control">
                    <option value="">Select Hiring Department</option>
                    <option value="BLS">Basic Life Support (BLS)</option>
                    <option value="ACLS">Advanced Cardiac Life Support (ACLS)</option>
                    <option value="PALS">Pediatric Advanced Life Support (PALS)</option>
                    <option value="NRP">Neonatal Resuscitation Program (NRP)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Hospital Department Hiring For</label>
                  <select className="form-control">
                    <option value="">Select Department</option>
                    <option value="ED">Emergency Department (ED) / Emergency Room (ER)</option>
                    <option value="ICU">Intensive Care Unit (ICU)</option>
                    <option value="MedSurg">Medical-Surgical Unit (Med-Surg)</option>
                    <option value="Telemetry">Telemetry Unit</option>
                    <option value="LD">Labor and Delivery (L&D)</option>
                    <option value="NICU">Neonatal Intensive Care Unit (NICU)</option>
                    <option value="Postpartum">Postpartum / Mother-Baby Unit</option>
                    <option value="PEDS">Pediatrics (PEDS)</option>
                    <option value="PICU">Pediatric Intensive Care Unit (PICU)</option>
                  </select>
                </div>
              </>
          )}

          {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
          )}

          <button type="submit" className="signup-button1">
            Sign Up
          </button>
        </form>
      </div>
  );
};

export default Signup;
