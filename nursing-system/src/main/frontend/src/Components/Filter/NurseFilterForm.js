import React from "react";
import "./FilterForm.css";

const FilterForm = ({ filters, onFilterChange, onReset }) => {
    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
                <label>Skill</label>
                <input
                    type="text"
                    name="skill"
                    placeholder="e.g., Pediatrics"
                    value={filters.skill}
                    onChange={onFilterChange}
                />
            </div>

            <div className="form-group">
                <label>Hours Available</label>
                <input
                    type="number"
                    name="hoursAvailable"
                    placeholder="e.g., 30"
                    value={filters.hoursAvailable}
                    onChange={onFilterChange}
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="filter-button">
                    Apply Filters
                </button>
                <button
                    type="button"
                    className="reset-button"
                    onClick={onReset}
                >
                    Reset Filters
                </button>
            </div>
        </form>
    );
};

export default FilterForm;