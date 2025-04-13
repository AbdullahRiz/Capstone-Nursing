import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./HireModel.css";

const HireModal = ({
                       visible,
                       onClose,
                       formData,
                       setFormData,
                       setIsHired,
                       setShowHireModal,
                       job,
                       nurseId,
                       nurseEmail,
                   }) => {
    const [useCustomAmount, setUseCustomAmount] = useState(false);
    const [useCustomHours, setUseCustomHours] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const predefinedAmounts = Array.from({ length: 10 }, (_, i) => 45 + i * 5);
    const predefinedHours = Array.from({ length: 3 }, (_, i) => 20 + i * 4);

    const daysOfWeek = [
        { id: "sunday", label: "S", name: "Sun" },
        { id: "monday", label: "M", name: "Mon" },
        { id: "tuesday", label: "T", name: "Tue" },
        { id: "wednesday", label: "W", name: "Wed" },
        { id: "thursday", label: "T", name: "Thu" },
        { id: "friday", label: "F", name: "Fri" },
        { id: "saturday", label: "S", name: "Sat" },
    ];

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!visible) return null;

    const areThreeDaysConsecutive = (selected) => {
        const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const selectedIndexes = selected
            .map((day) => dayOrder.indexOf(day))
            .sort((a, b) => a - b);

        for (let i = 0; i < selectedIndexes.length - 2; i++) {
            if (
                selectedIndexes[i + 1] === selectedIndexes[i] + 1 &&
                selectedIndexes[i + 2] === selectedIndexes[i] + 2
            ) {
                return true;
            }
        }
        return false;
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleContractUpload = async () => {
        if (!selectedFile) {
            alert('Please select a contract to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/uploadContract', {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("jwtToken")
                },
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Contract uploaded successfully!');
            } else {
                alert('Contract upload failed.');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('An error occurred during contract upload.');
        }
    };

    const handleConfirmHire = async () => {
        const {amount, startDate, endDate, hoursPerDay, selectedDays} = formData;
        const selectedLength = selectedDays.length;
        const isThreeConsecutive = areThreeDaysConsecutive(selectedDays);

        const isValid =
            amount &&
            startDate &&
            endDate &&
            hoursPerDay &&
            selectedLength > 0;

        if (!isValid) {
            alert("Please fill out all fields before submitting.");
            return;
        }

        if (selectedLength > 6) {
            alert("You cannot select more than 6 working days in a week.");
            return;
        }

        if (hoursPerDay <= 10 && amount < 45) {
            alert(
                "Minimum pay must be $45 if hours per day are less than or equal to 10."
            );
            return;
        }

        if (isThreeConsecutive) {
            if (hoursPerDay < 15 || hoursPerDay > 20) {
                alert(
                    "For 3 consecutive days, working hours must be between 15 and 20."
                );
                return;
            }
            if (amount < 50) {
                alert("Minimum pay must be $50 for 3 consecutive working days.");
                return;
            }
        }

        if (!isThreeConsecutive && selectedLength >= 4 && selectedLength <= 5) {
            if (amount < 65) {
                alert(
                    "Minimum pay must be $65 for 4-5 non-consecutive working days."
                );
                return;
            }
        }

        const payload = {
            jobTitle: job.jobTitle,
            nurseId: nurseId,
            jobApplicationId: job.id,
            pay: amount,
            hours: parseInt(hoursPerDay),
            days: selectedDays,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            contractFileName: selectedFile.name // update this with actual upload logic
        }

        try {
            const response = await handleContractUpload();

            const hiredResponse = await fetch("/api/hireNurse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwtToken")
                },
                body: JSON.stringify({
                    email: nurseEmail,
                    ...formData
                })
            });

            const res = await fetch("/api/jobOffer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwtToken")
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const msg = await res.text();
                alert("Failed to create offer: " + msg);
                return;
            }

            setTimeout(() => {
                setIsHired(true);
                setShowHireModal(false);
                alert("Hired successfully! (Simulated)");
            }, 500);
        } catch (err) {
            console.error("API error: ", err)
        }
    };

    return createPortal(
        <div className="hire-modal-overlay" onClick={onClose}>
            <div className="hire-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h3>Hire Details</h3>

                {/* Days of the Week */}
                <label>Days of the Week:</label>
                <div className="days-btn-container">
                    {daysOfWeek.map((day) => (
                        <React.Fragment key={day.id}>
                            <input
                                className="day-btn"
                                id={day.id}
                                type="checkbox"
                                checked={formData.selectedDays.includes(day.name)}
                                disabled={
                                    !formData.selectedDays.includes(day.name) &&
                                    formData.selectedDays.length >= 6
                                }
                                onChange={() => {
                                    const updatedDays = formData.selectedDays.includes(day.name)
                                        ? formData.selectedDays.filter((d) => d !== day.name)
                                        : [...formData.selectedDays, day.name];
                                    setFormData((prev) => ({
                                        ...prev,
                                        selectedDays: updatedDays,
                                    }));
                                }}
                            />
                            <label className="day-label" htmlFor={day.id}>{day.label}</label>
                        </React.Fragment>
                    ))}
                </div>

                {/* Hours per Day */}
                <label>Hours per Day:</label>
                {!useCustomHours ? (
                    <select
                        value={formData.hoursPerDay}
                        onChange={(e) => {
                            if (e.target.value === "custom") {
                                setUseCustomHours(true);
                                setFormData({...formData, hoursPerDay: ""});
                            } else {
                                setFormData({...formData, hoursPerDay: e.target.value});
                            }
                        }}
                    >
                        <option value="">Select hours</option>
                        {predefinedHours.map((hr) => (
                            <option key={hr} value={hr}>{`${hr} hr`}</option>
                        ))}
                        <option value="custom">Custom Hours</option>
                    </select>
                ) : (
                    <input
                        type="number"
                        placeholder="Enter custom hours"
                        value={formData.hoursPerDay}
                        min={10}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData({
                                ...formData,
                                hoursPerDay: val >= 10 ? val : 10,
                            });
                        }}
                        onBlur={() => {
                            if (!formData.hoursPerDay || formData.hoursPerDay < 10) {
                                setFormData({...formData, hoursPerDay: 10});
                            }
                        }}
                    />
                )}

                {/* Date Range */}
                <div className="date-range-container">
                    <div className="date-field">
                        <label>Start Date:</label>
                        <DatePicker
                            selected={formData.startDate ? new Date(formData.startDate) : null}
                            onChange={(date) =>
                                setFormData({
                                    ...formData,
                                    startDate: date.toISOString().split("T")[0],
                                    endDate:
                                        formData.endDate &&
                                        new Date(formData.endDate) < date
                                            ? null
                                            : formData.endDate,
                                })
                            }
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Start date"
                            className="datepicker-input"
                            minDate={new Date()}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                        />
                    </div>

                    <div className="date-field">
                        <label>End Date:</label>
                        <DatePicker
                            selected={formData.endDate ? new Date(formData.endDate) : null}
                            onChange={(date) =>
                                setFormData({
                                    ...formData,
                                    endDate: date.toISOString().split("T")[0],
                                })
                            }
                            dateFormat="yyyy-MM-dd"
                            placeholderText="End date"
                            className="datepicker-input"
                            minDate={
                                formData.startDate
                                    ? new Date(formData.startDate)
                                    : new Date()
                            }
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                        />
                    </div>
                </div>

                {/* Amount */}
                <label>Pay per Hour ($):</label>
                {!useCustomAmount ? (
                    <select
                        value={formData.amount}
                        onChange={(e) => {
                            if (e.target.value === "custom") {
                                setUseCustomAmount(true);
                                setFormData({...formData, amount: ""});
                            } else {
                                setFormData({...formData, amount: e.target.value});
                            }
                        }}
                    >
                        <option value="">Select amount</option>
                        {predefinedAmounts.map((amt) => (
                            <option key={amt} value={amt}>{`$${amt}`}</option>
                        ))}
                        <option value="custom">Custom Amount</option>
                    </select>
                ) : (
                    <input
                        type="number"
                        placeholder="Enter custom amount"
                        value={formData.amount}
                        min={45}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData({...formData, amount: val >= 45 ? val : 45});
                        }}
                        onBlur={() => {
                            if (!formData.amount || formData.amount < 45) {
                                setFormData({...formData, amount: 45});
                            }
                        }}
                    />
                )}

                <div className="upload-contract-field">
                    <label>Upload Contract</label>
                    <input type="file" onChange={handleFileChange} />
                </div>

                <button className="confirm-btn" onClick={handleConfirmHire}>
                    Confirm Hire
                </button>
            </div>
        </div>,
        document.body
    );
};

export default HireModal;
