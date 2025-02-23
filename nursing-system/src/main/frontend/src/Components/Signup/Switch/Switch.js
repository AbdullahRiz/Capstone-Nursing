const ToggleSwitch = ({ isNurse, toggleRole }) => {
  return (
    <div className="form-group switch-container">
      <div
        className={`toggle-switch ${isNurse ? "active" : ""}`}
        onClick={toggleRole}
      >
        <div className="toggle-labels">
          <span>Nurse</span>
          <span>Hospital</span>
        </div>
        <div className="toggle-slider">{isNurse ? "Nurse" : "Hospital"}</div>
      </div>
    </div>
  );
};

export default ToggleSwitch;
