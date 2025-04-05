import React from 'react';
import styled from 'styled-components';
import "./week.css"

const week = () => {
    return (
        <div className="week-container">
            <p className="section-label">Days of the week:</p>
            <break/>
            <div className="days-btn-container2">
                <input className="day-btn" id="sunday" type="checkbox" defaultChecked="false"/>
                <label className="day-label" htmlFor="sunday">S</label>
                <input className="day-btn" id="monday" type="checkbox" defaultChecked="false"/>
                <label className="day-label" htmlFor="monday">M</label>
                <input className="day-btn" id="tuesday" type="checkbox" defaultChecked="false"/>
                <label className="day-label" htmlFor="tuesday">T</label>
                <input className="day-btn" id="wednesday" type="checkbox" defaultChecked="false"/>
                <label className="day-label" htmlFor="wednesday">W</label>
                <input className="day-btn" id="thursday" type="checkbox" defaultChecked="false"/>
                <label className="day-label" htmlFor="thursday">T</label>
                <input className="day-btn" id="friday" type="checkbox" defaultChecked="false"/>
                <label className="day-label" htmlFor="friday">F</label>
                <input className="day-btn" id="saturday" type="checkbox" defaultChecked="false"/>
                <label className="day-label" htmlFor="saturday">S</label>
            </div>
        </div>
            );
            }


            export default week;
