import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateJobApplication.css";
import Footer from "../Footer/Footer";

const CreateJobApplication = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Check if user is a hospital
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const token = localStorage.getItem("jwtToken");
                if (!token) {
                    navigate("/signin");
                    return;
                }
                
                const response = await fetch("/api/getUserDetails", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (!response.ok) {
                    navigate("/signin");
                    return;
                }
                
                const userData = await response.json();
                if (userData.role !== "HOSPITAL") {
                    // Redirect to appropriate dashboard based on role
                    if (userData.role === "NURSE") {
                        navigate("/nurseDashboard");
                    } else {
                        navigate("/");
                    }
                }
            } catch (err) {
                console.error("Error checking user role:", err);
                navigate("/signin");
            }
        };
        
        checkUserRole();
    }, [navigate]);
    
    // Form state
    const [formData, setFormData] = useState({
        jobTitle: "",
        description: "",
        requiredSkills: [],
        hiringGoal: {
            targetDate: "",
            targetHours: "",
            preferredSkills: []
        },
        visibility: "PUBLIC",
        startDate: "",
        endDate: "",
        minPay: "",
        maxPay: "",
        contractFileName: ""
    });
    
    // Available skills from the SkillSet enum
    const availableSkills = [
        { value: "PATIENT_CARE", label: "Patient Care" },
        { value: "VITAL_SIGNS_MONITORING", label: "Vital Signs Monitoring" },
        { value: "MEDICATION_ADMINISTRATION", label: "Medication Administration" },
        { value: "IV_THERAPY", label: "IV Therapy" },
        { value: "WOUND_CARE", label: "Wound Care" },
        { value: "INFECTION_CONTROL", label: "Infection Control" },
        { value: "DOCUMENTATION", label: "Documentation" },
        { value: "HEALTH_EDUCATION", label: "Health Education" }
    ];
    
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith("hiringGoal.")) {
            const hiringGoalField = name.split(".")[1];
            setFormData({
                ...formData,
                hiringGoal: {
                    ...formData.hiringGoal,
                    [hiringGoalField]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };
    
    // Handle skill selection
    const handleSkillChange = (e, skillType) => {
        const skill = e.target.value;
        const isChecked = e.target.checked;
        
        if (skillType === "required") {
            if (isChecked) {
                setFormData({
                    ...formData,
                    requiredSkills: [...formData.requiredSkills, skill]
                });
            } else {
                setFormData({
                    ...formData,
                    requiredSkills: formData.requiredSkills.filter(s => s !== skill)
                });
            }
        } else if (skillType === "preferred") {
            if (isChecked) {
                setFormData({
                    ...formData,
                    hiringGoal: {
                        ...formData.hiringGoal,
                        preferredSkills: [...formData.hiringGoal.preferredSkills, skill]
                    }
                });
            } else {
                setFormData({
                    ...formData,
                    hiringGoal: {
                        ...formData.hiringGoal,
                        preferredSkills: formData.hiringGoal.preferredSkills.filter(s => s !== skill)
                    }
                });
            }
        }
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("jwtToken");
            
            if (!token) {
                throw new Error("No authentication token found");
            }
            
            // Format dates as ISO strings
            const formattedData = {
                ...formData,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                hiringGoal: {
                    ...formData.hiringGoal,
                    targetDate: formData.hiringGoal.targetDate ? new Date(formData.hiringGoal.targetDate).toISOString() : null,
                    targetHours: formData.hiringGoal.targetHours ? parseFloat(formData.hiringGoal.targetHours) : null
                },
                minPay: formData.minPay ? parseFloat(formData.minPay) : 0.0,
                maxPay: formData.maxPay ? parseFloat(formData.maxPay) : 0.0
            };
            
            const response = await fetch("/api/jobApplication", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formattedData)
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to create job application: ${errorData}`);
            }
            
            setSuccess(true);
            
            // Redirect to hospital dashboard after 2 seconds
            setTimeout(() => {
                navigate("/hospitalDashboard");
            }, 2000);
            
        } catch (err) {
            setError(err.message);
            console.error("Error creating job application:", err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <>
            <div className="create-job-container">
                <div className="create-job-header">
                    <h1>Create New Job Application</h1>
                    <p>Fill out the form below to create a new job application for nurses to apply to.</p>
                </div>
                
                {success ? (
                    <div className="success-message">
                        <i className="bi bi-check-circle-fill"></i>
                        <p>Job application created successfully! Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <form className="create-job-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-message">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                                <p>{error}</p>
                            </div>
                        )}
                        
                        <div className="form-section">
                            <h2>Basic Information</h2>
                            
                            <div className="form-group">
                                <label htmlFor="jobTitle">Job Title *</label>
                                <input
                                    type="text"
                                    id="jobTitle"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Registered Nurse, ICU Nurse"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="description">Job Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Provide a detailed description of the job..."
                                    rows="5"
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="startDate">Start Date *</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="endDate">End Date *</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="minPay">Minimum Pay Rate ($/hr) *</label>
                                    <input
                                        type="number"
                                        id="minPay"
                                        name="minPay"
                                        value={formData.minPay}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="maxPay">Maximum Pay Rate ($/hr) *</label>
                                    <input
                                        type="number"
                                        id="maxPay"
                                        name="maxPay"
                                        value={formData.maxPay}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="visibility">Visibility</label>
                                <select
                                    id="visibility"
                                    name="visibility"
                                    value={formData.visibility}
                                    onChange={handleInputChange}
                                >
                                    <option value="PUBLIC">Public</option>
                                    <option value="PRIVATE">Private</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-section">
                            <h2>Required Skills</h2>
                            <p>Select the skills that are required for this position:</p>
                            
                            <div className="skills-container">
                                {availableSkills.map(skill => (
                                    <div className="skill-checkbox" key={skill.value}>
                                        <input
                                            type="checkbox"
                                            id={`required-${skill.value}`}
                                            value={skill.value}
                                            checked={formData.requiredSkills.includes(skill.value)}
                                            onChange={(e) => handleSkillChange(e, "required")}
                                        />
                                        <label htmlFor={`required-${skill.value}`}>{skill.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="form-section">
                            <h2>Hiring Goals</h2>
                            
                            <div className="form-group">
                                <label htmlFor="hiringGoal.targetDate">Target Hiring Date</label>
                                <input
                                    type="date"
                                    id="hiringGoal.targetDate"
                                    name="hiringGoal.targetDate"
                                    value={formData.hiringGoal.targetDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="hiringGoal.targetHours">Target Hours per Week</label>
                                <input
                                    type="number"
                                    id="hiringGoal.targetHours"
                                    name="hiringGoal.targetHours"
                                    value={formData.hiringGoal.targetHours}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.5"
                                />
                            </div>
                            
                            <h3>Preferred Skills</h3>
                            <p>Select the skills that are preferred but not required:</p>
                            
                            <div className="skills-container">
                                {availableSkills.map(skill => (
                                    <div className="skill-checkbox" key={`preferred-${skill.value}`}>
                                        <input
                                            type="checkbox"
                                            id={`preferred-${skill.value}`}
                                            value={skill.value}
                                            checked={formData.hiringGoal.preferredSkills.includes(skill.value)}
                                            onChange={(e) => handleSkillChange(e, "preferred")}
                                        />
                                        <label htmlFor={`preferred-${skill.value}`}>{skill.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => navigate("/hospitalDashboard")}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create Job Application"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <Footer />
        </>
    );
};

export default CreateJobApplication;
