import React, { useState } from "react";
import "./FilterForm.css";
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

const FilterForm = ({ filters, onFilterChange, onSubmit, onReset }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div className={`filter-container ${isExpanded ? "expanded" : "collapsed"}`}>
            <div className="filter-header" onClick={toggleExpand}>
                <h5>Filter Applications</h5>
                <button className="toggle-button">
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>

            {/* Form Content */}
            {isExpanded && (
                <form onSubmit={onSubmit} className="filter-form">
                    <div className="form-group">
                        <label>Skill Set</label>
                        <input
                            type="text"
                            name="skillSet"
                            placeholder="e.g., Pediatrics"
                            value={filters.skillSet}
                            onChange={onFilterChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Minimum Hours</label>
                        <input
                            type="number"
                            name="minimumHours"
                            placeholder="e.g., 20"
                            value={filters.minimumHours}
                            onChange={onFilterChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Maximum Hours</label>
                        <input
                            type="number"
                            name="maximumHours"
                            placeholder="e.g., 40"
                            value={filters.maximumHours}
                            onChange={onFilterChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Hospital ID</label>
                        <input
                            type="text"
                            name="hospitalId"
                            placeholder="e.g., H123"
                            value={filters.hospitalId}
                            onChange={onFilterChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={onFilterChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={onFilterChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Minimum Pay</label>
                        <input
                            type="number"
                            name="minPay"
                            placeholder="e.g., 25.0"
                            value={filters.minPay}
                            onChange={onFilterChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Maximum Pay</label>
                        <input
                            type="number"
                            name="maxPay"
                            placeholder="e.g., 50.0"
                            value={filters.maxPay}
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
            )}
        </div>
    );
};

export default FilterForm;