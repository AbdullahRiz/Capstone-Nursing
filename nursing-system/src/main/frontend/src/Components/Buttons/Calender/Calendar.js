import React from 'react';
import styled from 'styled-components';

const Calendar = ({ selectedDays, setSelectedDays }) => {
    const days = [
        { id: 'sunday', label: 'Su', name: 'Sun' },
        { id: 'monday', label: 'M', name: 'Mon' },
        { id: 'tuesday', label: 'Tu', name: 'Tue' },
        { id: 'wednesday', label: 'W', name: 'Wed' },
        { id: 'thursday', label: 'Th', name: 'Thu' },
        { id: 'friday', label: 'F', name: 'Fri' },
        { id: 'saturday', label: 'Sa', name: 'Sat' }
    ];

    const handleChange = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day]
        );
    };

    console.log("Selected days:", selectedDays);

    return (
        <StyledWrapper>
            <div className="days-btn-container">
                {days.map(({ id, label, name }) => (
                    <React.Fragment key={id}>
                        <input
                            className="day-btn"
                            id={id}
                            type="checkbox"
                            checked={selectedDays.includes(name)}
                            onChange={() => handleChange(name)}
                        />
                        <label className="day-label" htmlFor={id}>{label}</label>
                    </React.Fragment>
                ))}
            </div>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
    .days-btn-container {
        display: flex;
        width: 100%;
        max-width: 340px;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        margin-top: 10px;
    }

    .day-btn {
        display: none;
    }

    .day-label {
        background-color: transparent;
        font-size: 12px;
        font-weight: 600;
        color: #008cff;
        cursor: pointer;
        border: 2px solid #008cff;
        border-radius: 20%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 5px;
        transition: all 0.2s ease;
    }

    .day-btn:checked + .day-label {
        background-color: #008cff;
        background-image: linear-gradient(147deg, #00ccff 0%, #004cff 74%);
        border: none;
        color: white;
    }
`;

export default Calendar;