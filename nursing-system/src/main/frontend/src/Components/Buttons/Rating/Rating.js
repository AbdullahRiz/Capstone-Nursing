import React, { useState, useEffect } from 'react';
import StyledWrapper from './RatingStyles';

const Rating = ({ userName, userEmail, totalRatings = 0, averageRating = 0 }) => {
    const [selectedRating, setSelectedRating] = useState(null);
    const [hoverRating, setHoverRating] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [review, setReview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Local state to update rating info
    const [localTotal, setLocalTotal] = useState(totalRatings);
    const [localAverage, setLocalAverage] = useState(averageRating);

    const handleRatingClick = (value) => {
        setSelectedRating(value);
        setShowPopup(true);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('/api/rate', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: userEmail,
                    rating: selectedRating,
                    review: review
                })
            });

            const data = await response.json()

            setLocalTotal(data.totalRatings);
            setLocalAverage(data.averageRating);
            setShowPopup(false);
            setReview('');
            alert(`Thank you for your ${selectedRating}-star rating!`);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Rating failed');
            console.error('Rating error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setShowPopup(false);
            }
        };
        if (showPopup) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => document.removeEventListener('keydown', handleEsc);
    }, [showPopup]);

    // Star SVG — full, half or empty
    const StarSVG = ({ fillType }) => {
        let fill = '#e4e5e9';

        if (fillType === 'full') {
            fill = '#FFD65A';
        } else if (fillType === 'half') {
            fill = 'url(#half)';
        }

        return (
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 576 512">
                <defs>
                    <linearGradient id="half">
                        <stop offset="50%" stopColor="#FFD65A" />
                        <stop offset="50%" stopColor="#e4e5e9" />
                    </linearGradient>
                </defs>
                <path
                    fill={fill}
                    d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3
                    51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9
                    32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9
                    31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7
                    23.9 4.9 33.8-2.3s14.9-19.3
                    12.9-31.3L438.5 329 542.7 225.9c8.6-8.5
                    11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2
                    150.3 316.9 18z"
                />
            </svg>
        );
    };

    const getStarFill = (index, rating) => {
        if (rating >= index + 1) return 'full';
        if (rating >= index + 0.5) return 'half';
        return 'empty';
    };

    const handleStarClick = (index, isHalf) => {
        const rating = isHalf ? index + 0.5 : index + 1;
        handleRatingClick(rating);
    };

    return (
        <StyledWrapper>
            {/* Star Rating */}
            <div className="radio">
                {[0, 1, 2, 3, 4].map((index) => (
                    <div
                        key={index}
                        className="star-wrapper"
                        style={{ position: 'relative', width: 24, height: 24, cursor: 'pointer' }}
                    >
                        {/* Left half */}
                        <div
                            style={{ position: 'absolute', width: '50%', height: '100%', left: 0, zIndex: 2 }}
                            onMouseEnter={() => setHoverRating(index + 0.5)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => handleStarClick(index, true)}
                        />
                        {/* Right half */}
                        <div
                            style={{ position: 'absolute', width: '50%', height: '100%', right: 0, zIndex: 2 }}
                            onMouseEnter={() => setHoverRating(index + 1)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => handleStarClick(index, false)}
                        />
                        {/* Star display */}
                        <StarSVG fillType={getStarFill(index, hoverRating ?? selectedRating ?? localAverage)} />
                    </div>
                ))}
            </div>

            {/* Rating Info */}
            <div className="rating-info">
                <span className="average">{localAverage.toFixed(1)} ({localTotal})</span>
                {error && <span className={"error"}>{error}</span>}
            </div>

            {/* Popup */}
            {showPopup && (
                <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                    <div className="popup" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
                        <h3 className="popup-title">Review <span className="username">({userName})</span></h3>
                        <div className="popup-stars">
                            Your Rating
                            {[0, 1, 2, 3, 4].map((index) => (
                                <StarSVG
                                    key={index}
                                    fillType={getStarFill(index, selectedRating ?? 0)}
                                />
                            ))}
                        </div>
                        <textarea
                            placeholder={`Please share how was your experience with ${userName}...`}
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                        <button onClick={handleSubmit} className="submit" disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Rating'}
                        </button>
                    </div>
                </div>
            )}
        </StyledWrapper>
    );
};

export default Rating;