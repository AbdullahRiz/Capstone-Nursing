import React from "react";
import "./ContractsPage.css";

const mockContracts = [
    {
        id: 1,
        hospitalName: "Sunrise General Hospital",
        nurseName: "Abigail Thomas",
        payPerHour: "$48.00",
        department: "Emergency Room",
        status: "current"
    },
    {
        id: 2,
        hospitalName: "Valleyview Medical Center",
        nurseName: "Abigail Thomas",
        payPerHour: "$52.50",
        department: "Intensive Care Unit",
        status: "previous"
    },
    {
        id: 3,
        hospitalName: "Meadowbrook Health Center",
        nurseName: "Abigail Thomas",
        payPerHour: "$45.00",
        department: "Pediatrics",
        status: "previous"
    },
    {
        id: 4,
        hospitalName: "Riverside City Hospital",
        nurseName: "Abigail Thomas",
        payPerHour: "$50.00",
        department: "Oncology",
        status: "previous"
    },
    {
        id: 5,
        hospitalName: "Mountainview Medical",
        nurseName: "Abigail Thomas",
        payPerHour: "$46.75",
        department: "Surgical Unit",
        status: "previous"
    },
    {
        id: 6,
        hospitalName: "Lakeside General Hospital",
        nurseName: "Abigail Thomas",
        payPerHour: "$44.00",
        department: "Maternity Ward",
        status: "previous"
    }
];


const ContractsPage = () => {
    const currentContracts = mockContracts.filter(c => c.status === "current");
    const previousContracts = mockContracts.filter(c => c.status === "previous");

    const renderContracts = (contracts) => (
        <div className="contracts-list">
            {contracts.map(contract => (
                <div key={contract.id} className="contract-card">
                    <h2 className="hospital-name">{contract.hospitalName}</h2>
                    <p><strong>Nurse Name:</strong> {contract.nurseName}</p>
                    <p><strong>Pay per Hour:</strong> {contract.payPerHour}</p>
                    <p><strong>Department:</strong> {contract.department}</p>
                </div>
            ))}
        </div>
    );

    return (
        <div className="contracts-container">
            <h1 className="contracts-title">Your Contracts</h1>

            <h2 className="section-title">Current Contracts</h2>
            {currentContracts.length ? renderContracts(currentContracts) : <p>No current contracts.</p>}

            <h2 className="section-title">Previous Contracts</h2>
            {previousContracts.length ? renderContracts(previousContracts) : <p>No previous contracts.</p>}
        </div>
    );
};

export default ContractsPage;
