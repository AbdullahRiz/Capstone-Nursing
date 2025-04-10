import styled from 'styled-components';

// Separate styled component for the popup that will be used with createPortal
export const PopupStyles = styled.div`
/* POPUP styles */
.popup-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
}

.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 999;
}

.popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    min-width: 300px;
    animation: fadeIn 0.3s ease-in-out;
    z-index: 1001;
}

.popup h3 {
    margin-top: 0;
    font-size: 18px;
    color: #333;
}

.popup textarea {
    width: 100%;
    height: 80px;
    margin: 10px 0;
    padding: 0.5rem;
    resize: none;
    font-size: 14px;
}

.submit {
    padding: 8px 16px;
    font-weight: 700;
    background-color: #7cb5e3;
    border: none;
    color: white;
    border-radius: 6px;
    cursor: pointer;
}

.submit:hover {
    background-color: #00b5ff;
}

.close-btn {
    position: absolute;
    top: 8px;
    right: 12px;
    background-color: transparent;
    border: none;
    font-size: 24px;
    font-weight: bold;
    color: #333;
    cursor: pointer;
    outline: none;         /* removes the blue outline */
    box-shadow: none;      /* removes focus shadow */
}

.close-btn:focus {
    outline: none;
    box-shadow: none;
}

.close-btn:hover {
    color: #ff0000;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.popup-stars {
    display: flex;
    justify-content: center;
    scale: 0.85;
    gap: 6px;
    margin-bottom: 10px;
}

.popup-stars svg {
    fill: #ff9e0b;
    height: 20px;
}

.username {
    font-weight: normal;
    font-size: 14px;
    color: #777;
    margin-left: 5px;
}
`;

const StyledWrapper = styled.div`
.radio {
    display: flex;
    justify-content: flex-start;
    gap: 8px;
    flex-direction: row;
    scale: 0.7;
    transform-origin: top left;
}

.radio > input {
    position: absolute;
    appearance: none;
}

.radio > label {
    cursor: pointer;
    font-size: 30px;
    position: relative;
    display: inline-block;
    transition: transform 0.3s ease;
}

.radio > label > svg {
    fill: #666;
    transition: fill 0.3s ease;
}

.radio > label:hover > svg {
    fill: #ff9e0b;
    filter: drop-shadow(0 0 15px rgba(255, 158, 11, 0.9));
    animation: shimmer 1s ease infinite alternate;
}

.radio > input:checked + label > svg {
    fill: #ff9e0b;
    filter: drop-shadow(0 0 15px rgba(255, 158, 11, 0.9));
    animation: pulse 0.8s infinite alternate;
}

.radio > input:checked + label ~ label > svg {
    fill: #ff9e0b;
}

.radio > input:checked + label:hover,
.radio > input:checked + label:hover ~ label {
    fill: #e58e09;
}

.radio > label:hover,
.radio > label:hover ~ label {
    fill: #ff9e0b;
}

.radio input:checked ~ label svg {
    fill: #ffa723;
}

@keyframes shimmer {
    0% {
        filter: drop-shadow(0 0 10px rgba(255, 158, 11, 0.5));
    }
    100% {
        filter: drop-shadow(0 0 20px rgba(255, 158, 11, 1));
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    100% {
        transform: scale(1.1);
    }
}
`;

export default StyledWrapper;
