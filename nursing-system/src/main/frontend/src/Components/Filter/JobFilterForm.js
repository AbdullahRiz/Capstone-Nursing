import React, { useState } from "react";
import "./FilterForm.css";
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

const FilterForm = ({ filters, onFilterChange, onSubmit, onReset, fieldErrors }) => {
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

            {isExpanded && (
                <form onSubmit={onSubmit} className="filter-form">
                    <div className="form-group">
                        <label>Skill Set</label>
                        <input
                            type="text"
                            name="skillSet"
                            value={filters.skillSet}
                            onChange={onFilterChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Minimum Hours</label>
                        <input
                            type="number"
                            name="minimumHours"
                            value={filters.minimumHours}
                            onChange={onFilterChange}
                        />
                        {fieldErrors?.minimumHours && (
                            <div className="error-text">{fieldErrors.minimumHours}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Maximum Hours</label>
                        <input
                            type="number"
                            name="maximumHours"
                            value={filters.maximumHours}
                            onChange={onFilterChange}
                        />
                        {fieldErrors?.maximumHours && (
                            <div className="error-text">{fieldErrors.maximumHours}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Hospital ID</label>
                        <input
                            type="text"
                            name="hospitalId"
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
                            value={filters.minPay}
                            onChange={onFilterChange}
                        />
                        {fieldErrors?.minPay && (
                            <div className="error-text">{fieldErrors.minPay}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Maximum Pay</label>
                        <input
                            type="number"
                            name="maxPay"
                            value={filters.maxPay}
                            onChange={onFilterChange}
                        />
                        {fieldErrors?.maxPay && (
                            <div className="error-text">{fieldErrors.maxPay}</div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="filter-button">Apply Filters</button>
                        <button type="button" className="reset-button" onClick={onReset}>Reset Filters</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default FilterForm;
