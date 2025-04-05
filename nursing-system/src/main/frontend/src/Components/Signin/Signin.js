import React, { useState } from "react";
import "../Signup/signup.css";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Dummy from "../Home/Dummy";
import JobListDashboard from "../Dashboard/JobListDashboard";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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

    // Validate email format
    if (!isValidEmail(formData.email)) {
      setErrorMessage("Invalid email format");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    const bodyData = {
      email: formData.email,
      password: formData.password,
    };

    console.log("Sign In Data Submitted:", bodyData);

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const token = data.token;
      localStorage.setItem("jwtToken", token);



      alert("Sign In Successful!");
      navigate("/JobListDashboard");
    } catch (error) {
      console.error("Error during fetch:", error);
      alert(`Sign In failed: ${error.message}`);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error message when user starts typing
    setErrorMessage("");
  };

  return (
      <div className="signup-container">
        <h2 className="signup-title">Sign In</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
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

          {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
          )}

          <button type="submit" className="signup-button1">
            Sign In
          </button>
        </form>
      </div>
  );
};

export default SignIn;