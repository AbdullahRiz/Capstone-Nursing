import React, { useState } from "react";
import "../Signup/signup.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const bodyData = {
      email: formData.email,
      password: formData.password,
    };

    console.log("Sign In Data Submitted:", bodyData);

    try {
      const response = await fetch("http://localhost:8080/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("Sign In Successful!");
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

          <div className="container mt-4">
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
          </div>

          <button type="submit" className="signup-button1">
            Sign In
          </button>
        </form>
      </div>
  );
};

export default SignIn;